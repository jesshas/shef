"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users, savedRecipes } from "../db/schema";
import { eq } from "drizzle-orm";
import { saveRecipeSchema } from "../validations/schemas";
import { checkLimit } from "../utils/checkLimit";

export interface SaveRecipeResult {
  success: boolean;
  recipeId?: string;
  error?: string;
  limitReached?: boolean;
}

/**
 * Server action: Save a recipe to the user's collection
 */
export async function saveRecipeAction(
  input: unknown
): Promise<SaveRecipeResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = saveRecipeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Check limits
  const limitCheck = await checkLimit(user.id, "recipes");
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: "You've reached the free limit of 4 saved recipes.",
      limitReached: true,
    };
  }

  const [recipe] = await db
    .insert(savedRecipes)
    .values({
      userId: user.id,
      title: parsed.data.title,
      url: parsed.data.url || null,
      notes: parsed.data.notes || null,
      tags: parsed.data.tags,
      ingredients: parsed.data.ingredients ?? [],
      steps: parsed.data.steps ?? [],
    })
    .returning();

  return { success: true, recipeId: recipe.id };
}

/**
 * Server action: Delete a saved recipe
 */
export async function deleteRecipeAction(
  recipeId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Verify ownership
  const recipe = await db.query.savedRecipes.findFirst({
    where: eq(savedRecipes.id, recipeId),
  });

  if (!recipe || recipe.userId !== user.id) {
    return { success: false, error: "Recipe not found" };
  }

  await db.delete(savedRecipes).where(eq(savedRecipes.id, recipeId));

  return { success: true };
}
