"use server";

import { db } from "../db/db";
import { waitlist } from "../db/schema";
import { waitlistSchema } from "../validations/schemas";

export interface CaptureWaitlistResult {
  success: boolean;
  error?: string;
  alreadyExists?: boolean;
}

/**
 * Server action: Add an email to the Pro waitlist
 */
export async function captureWaitlistEmailAction(
  input: unknown
): Promise<CaptureWaitlistResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address" };
  }

  try {
    await db.insert(waitlist).values({ email: parsed.data.email });
    return { success: true };
  } catch (error: unknown) {
    // Handle unique constraint violation (already on waitlist)
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return {
        success: true, // treat as success — they're already in
        alreadyExists: true,
      };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
