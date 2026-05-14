"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db/db";
import { users, manualGroceryLists } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { groceryCategorySchema } from "../validations/schemas";
import type { ManualGroceryList } from "../db/schema";
import type { GroceryCategory } from "../validations/schemas";

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

async function getAuthedUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);
  return user ?? null;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export interface ManualGroceryListResult {
  success: boolean;
  list?: ManualGroceryList;
  error?: string;
}

export async function createManualGroceryListAction(
  title: string
): Promise<ManualGroceryListResult> {
  const user = await getAuthedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const trimmed = title.trim();
  if (!trimmed) return { success: false, error: "Title is required" };

  const [list] = await db
    .insert(manualGroceryLists)
    .values({ userId: user.id, title: trimmed, categories: [] })
    .returning();

  return { success: true, list };
}

export async function updateManualGroceryListAction(input: {
  id: string;
  title?: string;
  categories?: unknown;
}): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const existing = await db
    .select({ userId: manualGroceryLists.userId })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.id, input.id))
    .limit(1);

  if (!existing[0] || existing[0].userId !== user.id) {
    return { success: false, error: "Not found" };
  }

  const updates: Partial<{ title: string; categories: GroceryCategory[]; updatedAt: Date }> = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) {
    const trimmed = input.title.trim();
    if (!trimmed) return { success: false, error: "Title is required" };
    updates.title = trimmed;
  }

  if (input.categories !== undefined) {
    const parsed = z.array(groceryCategorySchema).safeParse(input.categories);
    if (!parsed.success) return { success: false, error: "Invalid categories" };
    updates.categories = parsed.data;
  }

  await db
    .update(manualGroceryLists)
    .set(updates)
    .where(eq(manualGroceryLists.id, input.id));

  return { success: true };
}

export async function deleteManualGroceryListAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const existing = await db
    .select({ userId: manualGroceryLists.userId })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.id, id))
    .limit(1);

  if (!existing[0] || existing[0].userId !== user.id) {
    return { success: false, error: "Not found" };
  }

  await db.delete(manualGroceryLists).where(eq(manualGroceryLists.id, id));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------

export async function createManualGroceryShareTokenAction(
  id: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const user = await getAuthedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const [row] = await db
    .select({ userId: manualGroceryLists.userId, shareToken: manualGroceryLists.shareToken })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.id, id))
    .limit(1);

  if (!row || row.userId !== user.id) return { success: false, error: "Not found" };
  if (row.shareToken) return { success: true, token: row.shareToken };

  const token = generateToken();
  await db
    .update(manualGroceryLists)
    .set({ shareToken: token })
    .where(eq(manualGroceryLists.id, id));

  return { success: true, token };
}

/** Update a manual list via share token — no auth required */
export async function updateManualGroceryListViaTokenAction(input: {
  token: string;
  categories: unknown;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = z.array(groceryCategorySchema).safeParse(input.categories);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  const [row] = await db
    .select({ id: manualGroceryLists.id })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.shareToken, input.token))
    .limit(1);

  if (!row) return { success: false, error: "Share link not found or revoked" };

  await db
    .update(manualGroceryLists)
    .set({ categories: parsed.data, updatedAt: new Date() })
    .where(eq(manualGroceryLists.shareToken, input.token));

  return { success: true };
}
