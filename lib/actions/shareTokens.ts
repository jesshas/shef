"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { weekResults, savedRecipes, mealWeeks, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { groceryCategorySchema } from "../validations/schemas";

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// ---------------------------------------------------------------------------
// Grocery list sharing (weekResults)
// ---------------------------------------------------------------------------

export interface ShareTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

/** Generate (or return existing) share token for a week's grocery list */
export async function createGroceryShareTokenAction(
  weekId: string
): Promise<ShareTokenResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  // Verify ownership
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

  // Check if token already exists
  const existing = await db
    .select({ shareToken: weekResults.shareToken })
    .from(weekResults)
    .where(eq(weekResults.weekId, weekId))
    .limit(1);

  if (existing[0]?.shareToken) {
    return { success: true, token: existing[0].shareToken };
  }

  const token = generateToken();
  await db
    .update(weekResults)
    .set({ shareToken: token })
    .where(eq(weekResults.weekId, weekId));

  return { success: true, token };
}

/** Revoke the share token for a week's grocery list */
export async function revokeGroceryShareTokenAction(
  weekId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const week = await db
    .select({ userId: mealWeeks.userId })
    .from(mealWeeks)
    .where(eq(mealWeeks.id, weekId))
    .limit(1);

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!week[0] || !user[0] || week[0].userId !== user[0].id) {
    return { success: false, error: "Not authorized" };
  }

  await db
    .update(weekResults)
    .set({ shareToken: null })
    .where(eq(weekResults.weekId, weekId));

  return { success: true };
}

/** Update grocery list via share token — no auth required */
export async function updateSharedGroceryListAction(input: {
  token: string;
  categories: unknown;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = z.array(groceryCategorySchema).safeParse(input.categories);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  const row = await db
    .select({ id: weekResults.id })
    .from(weekResults)
    .where(eq(weekResults.shareToken, input.token))
    .limit(1);

  if (!row[0]) return { success: false, error: "Share link not found or revoked" };

  await db
    .update(weekResults)
    .set({ groceryList: parsed.data })
    .where(eq(weekResults.shareToken, input.token));

  return { success: true };
}

// ---------------------------------------------------------------------------
// Recipe sharing (savedRecipes)
// ---------------------------------------------------------------------------

/** Generate (or return existing) share token for a saved recipe */
export async function createRecipeShareTokenAction(
  recipeId: string
): Promise<ShareTokenResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);
  if (!user[0]) return { success: false, error: "User not found" };

  const recipe = await db
    .select({ userId: savedRecipes.userId, shareToken: savedRecipes.shareToken })
    .from(savedRecipes)
    .where(eq(savedRecipes.id, recipeId))
    .limit(1);

  if (!recipe[0]) return { success: false, error: "Recipe not found" };
  if (recipe[0].userId !== user[0].id) return { success: false, error: "Not authorized" };

  if (recipe[0].shareToken) {
    return { success: true, token: recipe[0].shareToken };
  }

  const token = generateToken();
  await db
    .update(savedRecipes)
    .set({ shareToken: token })
    .where(eq(savedRecipes.id, recipeId));

  return { success: true, token };
}

/** Revoke the share token for a saved recipe */
export async function revokeRecipeShareTokenAction(
  recipeId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  const recipe = await db
    .select({ userId: savedRecipes.userId })
    .from(savedRecipes)
    .where(eq(savedRecipes.id, recipeId))
    .limit(1);

  if (!user[0] || !recipe[0] || recipe[0].userId !== user[0].id) {
    return { success: false, error: "Not authorized" };
  }

  await db
    .update(savedRecipes)
    .set({ shareToken: null })
    .where(eq(savedRecipes.id, recipeId));

  return { success: true };
}
