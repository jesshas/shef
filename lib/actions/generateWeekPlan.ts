"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users, mealWeeks, meals, weekResults } from "../db/schema";
import { generateWeekPlan as runGeneration } from "../ai/generateWeekPlan";
import { eq } from "drizzle-orm";
import { mealSchema, weekPlanSchema } from "../validations/schemas";
import { checkLimit } from "../utils/checkLimit";
import { getCurrentWeekStart } from "../utils/weekHelpers";
import type { WeekResults, MealInput } from "../validations/schemas";

export interface GenerateWeekPlanInput {
  meals: MealInput[];
  weekId?: string;
}

export interface GenerateWeekPlanResult {
  success: boolean;
  results?: WeekResults;
  error?: string;
  weekId?: string;
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

  // Get user preferences if signed in
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (user) {
      dietaryPreferences = (user.dietaryPreferences as string[]) ?? [];
      dbUserId = user.id;
    }
  }

  // Run AI generation
  try {
    const results = await runGeneration({
      meals: validatedMeals,
      dietaryPreferences,
    });

  // If signed in, save results to DB
  if (userId && dbUserId) {
    let weekId = input.weekId;

    // Create or find the week record
    if (!weekId) {
      // Check limits
      const limitCheck = await checkLimit(dbUserId, "weeks");
      if (!limitCheck.allowed) {
        // Still return results, just don't save
        return { success: true, results };
      }

      const weekStartDate = getCurrentWeekStart();
      const [newWeek] = await db
        .insert(mealWeeks)
        .values({ userId: dbUserId, weekStartDate })
        .returning();
      weekId = newWeek.id;

      // Save meals
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

    // Save week results
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

      return { success: true, results, weekId };
    }
  }

  return { success: true, results };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Surface missing API key clearly
    if (message.includes("ANTHROPIC_API_KEY") || message.includes("OPENAI_API_KEY") || message.includes("authentication method")) {
      const provider = process.env.AI_PROVIDER === "openai" ? "OpenAI" : "Anthropic";
      return {
        success: false,
        error: `No ${provider} API key found. Add ${provider === "OpenAI" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"} to your .env.local file and restart the server.`,
      };
    }

    // Surface JSON parse errors from the AI response
    if (message.includes("JSON")) {
      return { success: false, error: "The AI returned an unexpected response. Please try again." };
    }

    return { success: false, error: "Something went wrong generating your plan. Please try again." };
  }
}
