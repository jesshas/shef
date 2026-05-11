"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { RecipeCard } from "../../../components/recipes/RecipeCard";
import { SaveRecipePanel } from "../../../components/recipes/SaveRecipePanel";
import { UpgradePrompt } from "../../../components/recipes/UpgradePrompt";
import { Button } from "../../../components/ui/Button";
import type { SavedRecipe } from "../../../lib/db/schema";

interface RecipesClientProps {
  recipes: SavedRecipe[];
  isAtLimit: boolean;
}

export function RecipesClient({ recipes, isAtLimit }: RecipesClientProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl text-espresso">Saved Recipes</h1>
          <p className="text-espresso/60 font-sans mt-1">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsPanelOpen(true)}
          disabled={isAtLimit}
        >
          <Plus size={16} />
          Save New Recipe
        </Button>
      </div>

      {/* Search */}
      {recipes.length > 0 && (
        <div className="relative mb-8">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-espresso/40"
          />
          <input
            type="search"
            placeholder="Search recipes or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose/30 rounded-xl font-sans text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose transition-colors"
          />
        </div>
      )}

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📖</div>
          <p className="font-serif text-xl text-espresso mb-2">No recipes saved yet</p>
          <p className="text-espresso/50 font-sans text-sm mb-6">
            Save your favorite meals to quickly reference them when planning
          </p>
          <Button variant="primary" onClick={() => setIsPanelOpen(true)}>
            <Plus size={16} />
            Save Your First Recipe
          </Button>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-espresso/50 font-sans">No recipes match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Upgrade prompt if at limit */}
      {isAtLimit && <UpgradePrompt context="recipes" />}

      <SaveRecipePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
