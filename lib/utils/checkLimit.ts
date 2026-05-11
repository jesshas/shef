import { db } from "../db/db";
import { mealWeeks, savedRecipes, users } from "../db/schema";
import { count, eq } from "drizzle-orm";

export const FREE_LIMITS = {
  weeks: 4,
  recipes: 4,
  generations: 4,
} as const;

type LimitType = keyof typeof FREE_LIMITS;

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

/**
 * Check if a user has reached a free tier limit
 */
export async function checkLimit(
  userId: string,
  limitType: LimitType
): Promise<LimitCheck> {
  const limit = FREE_LIMITS[limitType];
  let current = 0;

  if (limitType === "weeks") {
    const result = await db
      .select({ count: count() })
      .from(mealWeeks)
      .where(eq(mealWeeks.userId, userId));
    current = result[0]?.count ?? 0;
  } else if (limitType === "recipes") {
    const result = await db
      .select({ count: count() })
      .from(savedRecipes)
      .where(eq(savedRecipes.userId, userId));
    current = result[0]?.count ?? 0;
  } else if (limitType === "generations") {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { generationCount: true, plan: true },
    });
    // Pro users have unlimited generations
    if (user?.plan === "pro") {
      return { allowed: true, current: 0, limit, remaining: Infinity };
    }
    current = user?.generationCount ?? 0;
  }

  return {
    allowed: current < limit,
    current,
    limit,
    remaining: Math.max(0, limit - current),
  };
}
