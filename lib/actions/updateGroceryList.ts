"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { weekResults, mealWeeks, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { groceryCategorySchema } from "../validations/schemas";

const inputSchema = z.object({
  weekId: z.string().uuid(),
  categories: z.array(groceryCategorySchema),
});

export interface UpdateGroceryListResult {
  success: boolean;
  error?: string;
}

export async function updateGroceryListAction(
  input: unknown
): Promise<UpdateGroceryListResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  const { weekId, categories } = parsed.data;

  // Verify the week belongs to this user
  const week = await db
    .select({ userId: mealWeeks.userId })
    .from(mealWeeks)
    .where(eq(mealWeeks.id, weekId))
    .limit(1);

  if (!week[0]) return { success: false, error: "Week not found" };

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user[0] || week[0].userId !== user[0].id) {
    return { success: false, error: "Not authorized" };
  }

  await db
    .update(weekResults)
    .set({ groceryList: categories })
    .where(eq(weekResults.weekId, weekId));

  return { success: true };
}
