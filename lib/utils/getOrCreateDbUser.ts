import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { User } from "../db/schema";

/**
 * Fetch the DB user for the currently signed-in Clerk user.
 * If no DB row exists yet (e.g. webhook hasn't fired in local dev),
 * it creates one on the fly so auth-required pages never break.
 *
 * Returns null if there is no Clerk session.
 */
export async function getOrCreateDbUser(): Promise<User | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  // Fast path — user already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (existing) return existing;

  // Slow path — first request after sign-up, webhook hasn't fired yet
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const [created] = await db
    .insert(users)
    .values({ clerkId, email: primaryEmail, name })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email: primaryEmail, name },
    })
    .returning();

  return created ?? null;
}
