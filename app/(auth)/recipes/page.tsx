import { redirect } from "next/navigation";
import { db } from "../../../lib/db/db";
import { savedRecipes } from "../../../lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOrCreateDbUser } from "../../../lib/utils/getOrCreateDbUser";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { RecipesClient } from "./RecipesClient";
import { FREE_LIMITS } from "../../../lib/utils/checkLimit";

export default async function RecipesPage() {
  const user = await getOrCreateDbUser();
  if (!user) redirect("/sign-in");

  const recipes = await db.query.savedRecipes.findMany({
    where: eq(savedRecipes.userId, user.id),
    orderBy: [desc(savedRecipes.createdAt)],
  });

  const isAtLimit = user.plan === "free" && recipes.length >= FREE_LIMITS.recipes;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        <RecipesClient recipes={recipes} isAtLimit={isAtLimit} />
      </main>
      <Footer />
    </div>
  );
}
