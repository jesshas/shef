import { Badge } from "../ui/Badge";
import { BookOpen, ExternalLink } from "lucide-react";
import type { SavedRecipe } from "../../lib/db/schema";

interface RecipeCardProps {
  recipe: SavedRecipe;
  onDelete?: (id: string) => void;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const nutrition = recipe.nutritionSnapshot as {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null;

  return (
    <div className="bg-white border border-rose/30 rounded-2xl p-5 hover:border-rose/60 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-sage" />
            <h3 className="font-serif tracking-tighter text-base text-espresso line-clamp-2">
              {recipe.title}
            </h3>
          </div>
          {recipe.url && (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sage hover:text-sage-dark transition-colors inline-flex items-center gap-1"
            >
              View recipe
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Nutrition snapshot */}
      {nutrition?.calories && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Cal", value: nutrition.calories, unit: "" },
            { label: "Protein", value: nutrition.protein, unit: "g" },
            { label: "Carbs", value: nutrition.carbs, unit: "g" },
            { label: "Fat", value: nutrition.fat, unit: "g" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-cream rounded-lg p-2 text-center">
              <p className="text-[10px] font-sans text-espresso/50 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-sm font-sans font-semibold text-espresso">
                {value !== undefined ? `${Math.round(value)}${unit}` : "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="rose">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Date */}
      <p className="text-[10px] text-espresso/30 font-sans mt-3">
        Saved {new Date(recipe.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
