"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users, mealWeeks, meals, weekResults } from "../db/schema";
import { generateWeekPlan as runGeneration } from "../ai/generateWeekPlan";
import { eq, sql } from "drizzle-orm";
import { mealSchema } from "../validations/schemas";
import { checkLimit, FREE_LIMITS } from "../utils/checkLimit";
import { getCurrentWeekStart } from "../utils/weekHelpers";
import type { WeekResults, MealInput } from "../validations/schemas";

export interface GenerateWeekPlanInput {
  meals: MealInput[];
  weekId?: string;
  /** Guest generation count passed from localStorage (used to enforce limit server-side for guests) */
  guestGenerationCount?: number;
  /** Serving size for guests (signed-in users use their saved preference) */
  guestServingSize?: number;
}

export interface GenerateWeekPlanResult {
  success: boolean;
  results?: WeekResults;
  error?: string;
  /** "generation_limit" signals the UI to show the paywall modal */
  errorCode?: "generation_limit";
  weekId?: string;
  servingSize?: number;
  /** Updated generation count so the client can sync localStorage */
  generationsUsed?: number;
  generationsRemaining?: number;
}

/**
 * Server action: Generate the full week plan (nutrition + grocery list)
 * Works for both guests (no saving) and signed-in users (saves to DB)
 */
export async function generateWeekPlanAction(
  input: GenerateWeekPlanInput
): Promise<GenerateWeekPlanResult> {
  const { userId } = await auth();

  // Validate input meals
  const validatedMeals: MealInput[] = [];
  for (const meal of input.meals) {
    const parsed = mealSchema.safeParse(meal);
    if (parsed.success) {
      validatedMeals.push(parsed.data);
    }
  }

  if (validatedMeals.length < 3) {
    return { success: false, error: "Please add at least 3 meals to generate your plan." };
  }

  let dietaryPreferences: string[] = [];
  let dbUserId: string | undefined;
  let servingSize = 1;

  // --- Signed-in: check + enforce generation limit in DB ---
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (user) {
      dietaryPreferences = (user.dietaryPreferences as string[]) ?? [];
      dbUserId = user.id;
      servingSize = user.servingSize ?? 1;

      // Pro users have unlimited generations
      if (user.plan !== "pro") {
        const genCount = user.generationCount ?? 0;
        if (genCount >= FREE_LIMITS.generations) {
          return {
            success: false,
            errorCode: "generation_limit",
            error: "You've used all 4 free plan generations.",
            generationsUsed: genCount,
            generationsRemaining: 0,
          };
        }
      }
    }
  } else {
    // --- Guest: trust the count passed from client localStorage ---
    const guestCount = input.guestGenerationCount ?? 0;
    if (guestCount >= FREE_LIMITS.generations) {
      return {
        success: false,
        errorCode: "generation_limit",
        error: "You've used all 4 free plan generations.",
        generationsUsed: guestCount,
        generationsRemaining: 0,
      };
    }
    servingSize = Math.max(1, Math.min(20, input.guestServingSize ?? 1));
  }

  // Run AI generation
  try {
    const results = await runGeneration({
      meals: validatedMeals,
      dietaryPreferences,
      servingSize,
    });

    // --- Post-generation: increment count and save to DB if signed in ---
    if (userId && dbUserId) {
      // Atomically increment the generation counter
      await db
        .update(users)
        .set({ generationCount: sql`${users.generationCount} + 1` })
        .where(eq(users.id, dbUserId));

      let weekId = input.weekId;

      if (!weekId) {
        const limitCheck = await checkLimit(dbUserId, "weeks");
        if (limitCheck.allowed) {
          const weekStartDate = getCurrentWeekStart();
          const [newWeek] = await db
            .insert(mealWeeks)
            .values({ userId: dbUserId, weekStartDate })
            .returning();
          weekId = newWeek.id;

          if (validatedMeals.length > 0) {
            await db.insert(meals).values(
              validatedMeals.map((m) => ({
                weekId: weekId!,
                dayOfWeek: m.dayOfWeek,
                mealType: m.mealType,
                title: m.title,
                recipeUrl: m.recipeUrl || null,
                notes: m.notes || null,
              }))
            );
          }
        }
      }

      if (weekId) {
        await db
          .insert(weekResults)
          .values({
            weekId,
            groceryList: results.categories,
            nutritionSummary: {},
            perMealNutrition: results.mealNutrition,
          })
          .onConflictDoUpdate({
            target: weekResults.weekId,
            set: {
              groceryList: results.categories,
              nutritionSummary: {},
              perMealNutrition: results.mealNutrition,
              generatedAt: new Date(),
            },
          });
      }

      // Fetch updated count to return to client
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, dbUserId),
        columns: { generationCount: true },
      });
      const used = updatedUser?.generationCount ?? 0;
      return {
        success: true,
        results,
        weekId,
        servingSize,
        generationsUsed: used,
        generationsRemaining: Math.max(0, FREE_LIMITS.generations - used),
      };
    }

    // Guest: client will increment localStorage count after success
    const guestCount = (input.guestGenerationCount ?? 0) + 1;
    return {
      success: true,
      results,
      servingSize,
      generationsUsed: guestCount,
      generationsRemaining: Math.max(0, FREE_LIMITS.generations - guestCount),
    };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("ANTHROPIC_API_KEY") || message.includes("OPENAI_API_KEY") || message.includes("authentication method")) {
      const provider = process.env.AI_PROVIDER === "openai" ? "OpenAI" : "Anthropic";
      return {
        success: false,
        error: `No ${provider} API key found. Add ${provider === "OpenAI" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"} to your .env.local file and restart the server.`,
      };
    }

    if (message.includes("JSON")) {
      return { success: false, error: "The AI returned an unexpected response. Please try again." };
    }

    return { success: false, error: "Something went wrong generating your plan. Please try again." };
  }
}
