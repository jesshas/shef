import { notFound, redirect } from "next/navigation";
import { db } from "../../../../lib/db/db";
import { manualGroceryLists, users } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateDbUser } from "../../../../lib/utils/getOrCreateDbUser";
import { ManualListClient } from "./ManualListClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [row] = await db
    .select({ title: manualGroceryLists.title })
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.id, id))
    .limit(1);
  return { title: row ? `${row.title} | shef` : "Grocery List | shef" };
}

export default async function ManualListPage({ params }: Props) {
  const { id } = await params;
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const [list] = await db
    .select()
    .from(manualGroceryLists)
    .where(eq(manualGroceryLists.id, id))
    .limit(1);

  if (!list || list.userId !== user.id) notFound();

  return <ManualListClient list={list} />;
}
