"use server";

import { generateRecipeDetails, type RecipeDetails } from "../ai/generateWeekPlan";

export interface GenerateRecipeDetailsResult {
  success: boolean;
  recipe?: RecipeDetails;
  error?: string;
}

export async function generateRecipeDetailsAction(input: {
  title: string;
  recipeUrl?: string;
  notes?: string;
}): Promise<GenerateRecipeDetailsResult> {
  try {
    const recipe = await generateRecipeDetails(input.title, input.recipeUrl, input.notes);
    return { success: true, recipe };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("ANTHROPIC_API_KEY") || message.includes("OPENAI_API_KEY")) {
      return { success: false, error: "AI provider not configured." };
    }
    return { success: false, error: "Couldn't generate recipe details. Please try again." };
  }
}
