"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { DIETARY_PREFERENCES } from "../validations/schemas";
import { z } from "zod";

const preferencesSchema = z.object({
  dietaryPreferences: z.array(z.enum(DIETARY_PREFERENCES)).max(10),
});

export interface UpdatePreferencesResult {
  success: boolean;
  error?: string;
}

/**
 * Server action: Update user dietary preferences
 */
export async function updateDietaryPreferencesAction(
  input: unknown
): Promise<UpdatePreferencesResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid preferences" };
  }

  await db
    .update(users)
    .set({ dietaryPreferences: parsed.data.dietaryPreferences })
    .where(eq(users.clerkId, userId));

  return { success: true };
}
