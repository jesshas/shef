import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db/db";
import { manualGroceryLists } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { SharedManualListClient } from "./SharedManualListClient";
import type { GroceryCategory } from "../../../../lib/validations/schemas";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const [row] = await db
    .select({ title: manualGroceryLists.title })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.shareToken, token))
    .limit(1);
  return { title: row ? `Check out my grocery list: ${row.title} | shef` : "Shared Grocery List | shef" };
}

export default async function SharedManualListPage({ params }: Props) {
  const { token } = await params;
  const { userId } = await auth();

  const [row] = await db
    .select({
      title: manualGroceryLists.title,
      categories: manualGroceryLists.categories,
    })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.shareToken, token))
    .limit(1);

  if (!row) notFound();

  return (
    <SharedManualListClient
      token={token}
      title={row.title}
      categories={row.categories as GroceryCategory[]}
      isLoggedIn={!!userId}
    />
  );
}
