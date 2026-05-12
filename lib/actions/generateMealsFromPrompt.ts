"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { generateMealsFromPrompt } from "../ai/generateMealsFromPrompt";
import type { GeneratedMealSuggestion } from "../ai/generateMealsFromPrompt";
import { AI_PROMPT_LIMIT } from "../utils/checkLimit";

export interface GenerateMealsFromPromptInput {
  userPrompt: string;
  /** Guest AI prompt count from localStorage */
  guestAiPromptCount?: number;
}

export interface GenerateMealsFromPromptResult {
  success: boolean;
  meals?: GeneratedMealSuggestion[];
  error?: string;
  errorCode?: "prompt_limit" | "prompt_too_short";
}

const MIN_PROMPT_LENGTH = 60;

export async function generateMealsFromPromptAction(
  input: GenerateMealsFromPromptInput
): Promise<GenerateMealsFromPromptResult> {
  const { userId } = await auth();

  const trimmed = input.userPrompt.trim();
  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return {
      success: false,
      errorCode: "prompt_too_short",
      error: `Please give shef a bit more to work with — at least ${MIN_PROMPT_LENGTH} characters helps get better results.`,
    };
  }

  let dietaryPreferences: string[] = [];

  if (userId) {
    // Signed-in: check DB aiPromptCount
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (user) {
      dietaryPreferences = (user.dietaryPreferences as string[]) ?? [];

      if (user.plan !== "pro" && (user.aiPromptCount ?? 0) >= AI_PROMPT_LIMIT) {
        return {
          success: false,
          errorCode: "prompt_limit",
          error: "You've used your 1 free AI prompt. Upgrade to Pro for unlimited.",
        };
      }
    }
  } else {
    // Guest: trust count from localStorage
    if ((input.guestAiPromptCount ?? 0) >= AI_PROMPT_LIMIT) {
      return {
        success: false,
        errorCode: "prompt_limit",
        error: "You've used your 1 free AI prompt. Create an account or upgrade to Pro.",
      };
    }
  }

  try {
    const meals = await generateMealsFromPrompt(trimmed, dietaryPreferences);

    // Increment counter for signed-in users
    if (userId) {
      await db
        .update(users)
        .set({ aiPromptCount: sql`${users.aiPromptCount} + 1` })
        .where(eq(users.clerkId, userId));
    }
    // Guest: client increments localStorage after success

    return { success: true, meals };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("ANTHROPIC_API_KEY") || message.includes("OPENAI_API_KEY")) {
      const provider = process.env.AI_PROVIDER === "openai" ? "OpenAI" : "Anthropic";
      return {
        success: false,
        error: `No ${provider} API key configured.`,
      };
    }

    return {
      success: false,
      error: "Couldn't generate meal ideas. Please try again.",
    };
  }
}
