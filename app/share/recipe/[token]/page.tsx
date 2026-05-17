import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db/db";
import { savedRecipes } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { ExternalLink, BookOpen } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge";
import { SignUpGate } from "../../../../components/share/SignUpGate";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const row = await db
    .select({ title: savedRecipes.title })
    .from(savedRecipes)
    .where(eq(savedRecipes.shareToken, token))
    .limit(1);

  return {
    title: row[0] ? `Check out this recipe: ${row[0].title}` : "Shared recipe",
  };
}

export default async function SharedRecipePage({ params }: Props) {
  const { token } = await params;
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  const row = await db
    .select()
    .from(savedRecipes)
    .where(eq(savedRecipes.shareToken, token))
    .limit(1);

  if (!row[0]) notFound();

  const recipe = row[0];
  const nutrition = recipe.nutritionSnapshot as {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-rose/20 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-2xl tracking-tighter text-espresso">shef</span>
          <p className="text-xs font-sans text-espresso/50">Shared recipe</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Title — always visible as a teaser */}
        <div className="flex items-start gap-3 mb-6">
          <BookOpen size={20} className="text-sage mt-1 shrink-0" />
          <div>
            <h1 className="font-serif tracking-tighter text-2xl sm:text-3xl text-espresso leading-tight">
              {recipe.title}
            </h1>
            {recipe.url && (
              <a
                href={recipe.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-sage-dark transition-colors mt-1"
              >
                View original recipe
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Recipe details — gated for guests */}
        <SignUpGate isLoggedIn={isLoggedIn} returnTo={`/share/recipe/${token}`}>
          <div className="bg-white border border-rose/30 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Nutrition */}
            {nutrition?.calories && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Calories", value: nutrition.calories, unit: "" },
                  { label: "Protein", value: nutrition.protein, unit: "g" },
                  { label: "Carbs", value: nutrition.carbs, unit: "g" },
                  { label: "Fat", value: nutrition.fat, unit: "g" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="bg-cream rounded-xl p-3 text-center border border-rose/10">
                    <p className="text-[10px] font-sans text-espresso/50 uppercase tracking-wide mb-1">
                      {label}
                    </p>
                    <p className="text-lg font-serif tracking-tighter text-espresso">
                      {value !== undefined ? `${Math.round(value)}${unit}` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {recipe.notes && (
              <div className="mb-6">
                <p className="text-[11px] font-sans font-semibold text-espresso/40 uppercase tracking-wider mb-2">
                  Notes
                </p>
                <p className="text-sm font-sans text-espresso/80 leading-relaxed">{recipe.notes}</p>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="rose">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </SignUpGate>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs text-espresso/30 font-sans hover:text-espresso/60 transition-colors"
          >
            Plan your own week with shef →
          </a>
        </div>
      </main>
    </div>
  );
}
