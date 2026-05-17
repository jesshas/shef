"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users, mealWeeks } from "../db/schema";
import { eq } from "drizzle-orm";

export interface UpdateWeekDateResult {
  success: boolean;
  error?: string;
}

/**
 * Server action: Update the weekStartDate for a week the current user owns.
 * weekStartDate must be a Monday in YYYY-MM-DD format.
 */
export async function updateWeekDateAction(
  weekId: string,
  weekStartDate: string
): Promise<UpdateWeekDateResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
    return { success: false, error: "Invalid date format" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { success: false, error: "User not found" };

  const week = await db.query.mealWeeks.findFirst({
    where: eq(mealWeeks.id, weekId),
  });
  if (!week || week.userId !== user.id) {
    return { success: false, error: "Week not found" };
  }

  await db
    .update(mealWeeks)
    .set({ weekStartDate })
    .where(eq(mealWeeks.id, weekId));

  return { success: true };
}
