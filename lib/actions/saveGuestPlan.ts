"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users, mealWeeks, meals } from "../db/schema";
import { eq } from "drizzle-orm";
import { weekPlanSchema } from "../validations/schemas";
import { checkLimit } from "../utils/checkLimit";
import { getCurrentWeekStart } from "../utils/weekHelpers";
import type { GuestPlan } from "../guest/guestStorage";

export interface SaveGuestPlanResult {
  success: boolean;
  weekId?: string;
  error?: string;
}

/**
 * Server action: Import guest localStorage plan to DB after sign-up/sign-in
 */
export async function saveGuestPlanAction(
  guestPlan: GuestPlan
): Promise<SaveGuestPlanResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate guest plan
  const parsed = weekPlanSchema.safeParse({
    weekStartDate: guestPlan.weekStartDate,
    meals: guestPlan.meals,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid plan data" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Check limits
  const limitCheck = await checkLimit(user.id, "weeks");
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: "You've reached the free plan limit of 4 weeks.",
    };
  }

  // Create the week record
  const weekStartDate = parsed.data.weekStartDate || getCurrentWeekStart();
  const [newWeek] = await db
    .insert(mealWeeks)
    .values({ userId: user.id, weekStartDate })
    .returning();

  // Save meals
  if (parsed.data.meals.length > 0) {
    await db.insert(meals).values(
      parsed.data.meals.map((m) => ({
        weekId: newWeek.id,
        dayOfWeek: m.dayOfWeek,
        mealType: m.mealType,
        title: m.title,
        recipeUrl: m.recipeUrl || null,
        notes: m.notes || null,
      }))
    );
  }

  return { success: true, weekId: newWeek.id };
}
