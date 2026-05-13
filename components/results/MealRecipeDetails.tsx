"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { generateRecipeDetailsAction } from "../../lib/actions/generateRecipeDetails";
import type { RecipeDetails } from "../../lib/ai/generateWeekPlan";

interface MealRecipeDetailsProps {
  mealId: string;
  title: string;
  recipeUrl?: string;
  notes?: string;
}

export function MealRecipeDetails({ mealId, title, recipeUrl, notes }: MealRecipeDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    // Already fetched — don't re-fetch
    if (recipe) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateRecipeDetailsAction({ title, recipeUrl, notes });
      if (result.success && result.recipe) {
        setRecipe(result.recipe);
      } else {
        setError(result.error ?? "Couldn't load recipe");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-3 border-t border-rose/10 pt-3">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-xs font-sans text-espresso/50 hover:text-espresso/80 transition-colors"
      >
        <Sparkles size={11} className="text-rose/60" />
        <span>{isOpen ? "Hide" : "Show"} recipe</span>
        {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {isOpen && (
        <div className="mt-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-espresso/40 font-sans py-2">
              <Loader2 size={12} className="animate-spin" />
              Generating recipe...
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 font-sans py-1">{error}</p>
          )}

          {recipe && (
            <div className="space-y-4 animate-slide-up">
              {/* Ingredients */}
              <div>
                <p className="text-[11px] font-sans font-semibold text-espresso/50 uppercase tracking-wider mb-2">
                  Ingredients
                </p>
                <ul className="space-y-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-sans text-espresso/80">
                      <span className="mt-[3px] w-1 h-1 rounded-full bg-rose/50 flex-shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <p className="text-[11px] font-sans font-semibold text-espresso/50 uppercase tracking-wider mb-2">
                  How to make it
                </p>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-sans text-espresso/80">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-espresso/10 text-espresso/60 flex items-center justify-center text-[10px] font-semibold mt-[1px]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {recipeUrl && (
                <p className="text-[10px] text-espresso/30 font-sans italic">
                  AI-generated based on the recipe. For exact measurements,{" "}
                  <a
                    href={recipeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-espresso/60 transition-colors"
                  >
                    view the original
                  </a>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
