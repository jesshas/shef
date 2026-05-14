import { notFound } from "next/navigation";
import { db } from "../../../../lib/db/db";
import { weekResults, mealWeeks } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { SharedGroceryClient } from "./SharedGroceryClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const row = await db
    .select({ weekId: weekResults.weekId })
    .from(weekResults)
    .where(eq(weekResults.shareToken, token))
    .limit(1);

  if (!row[0]) return { title: "Shared Grocery List | shef" };
  return { title: "Shared Grocery List | shef" };
}

export default async function SharedGroceryPage({ params }: Props) {
  const { token } = await params;

  const row = await db
    .select({
      groceryList: weekResults.groceryList,
      weekId: weekResults.weekId,
    })
    .from(weekResults)
    .where(eq(weekResults.shareToken, token))
    .limit(1);

  if (!row[0]) notFound();

  // Get week label for context
  const week = await db
    .select({ weekStartDate: mealWeeks.weekStartDate })
    .from(mealWeeks)
    .where(eq(mealWeeks.id, row[0].weekId))
    .limit(1);

  return (
    <SharedGroceryClient
      token={token}
      categories={row[0].groceryList as Parameters<typeof SharedGroceryClient>[0]["categories"]}
      weekStartDate={week[0]?.weekStartDate ?? null}
    />
  );
}
