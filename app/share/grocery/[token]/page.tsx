import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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
    .select({ weekStartDate: mealWeeks.weekStartDate })
    .from(weekResults)
    .leftJoin(mealWeeks, eq(mealWeeks.id, weekResults.weekId))
    .where(eq(weekResults.shareToken, token))
    .limit(1);

  if (!row[0]?.weekStartDate) return { title: "Check out my grocery list | shef" };

  const start = new Date(row[0].weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekRange = `${fmt(start)}\u2013${fmt(end)}`;

  return { title: `Check out my grocery list for ${weekRange} | shef` };
}

export default async function SharedGroceryPage({ params }: Props) {
  const { token } = await params;
  const { userId } = await auth();

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
      isLoggedIn={!!userId}
    />
  );
}
