import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db/db";
import { users, mealWeeks, meals, weekResults } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { WeekPlanView } from "./WeekPlanView";

interface PageProps {
  params: Promise<{ weekId: string }>;
}

export default async function WeekPage({ params }: PageProps) {
  const { weekId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/plan/new");
  }

  // Fetch user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    redirect("/plan/new");
  }

  // Fetch week and verify ownership
  const week = await db.query.mealWeeks.findFirst({
    where: eq(mealWeeks.id, weekId),
  });

  if (!week || week.userId !== user.id) {
    redirect("/dashboard");
  }

  // Fetch meals for this week
  const weekMeals = await db.query.meals.findMany({
    where: eq(meals.weekId, weekId),
  });

  // Fetch results if they exist
  const weekResult = await db.query.weekResults.findFirst({
    where: eq(weekResults.weekId, weekId),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <WeekPlanView
          week={week}
          meals={weekMeals}
          savedResults={weekResult ?? null}
          userId={user.id}
        />
      </main>
      <Footer />
    </div>
  );
}
