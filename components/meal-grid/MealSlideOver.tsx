"use client";

import { useState, useEffect } from "react";
import { SlideOver } from "../ui/SlideOver";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { ExternalLink, Copy, Trash2, Bookmark, BookmarkCheck } from "lucide-react";
import type { DayOfWeek, MealInput, MealType } from "../../lib/validations/schemas";
import { saveRecipeAction } from "../../lib/actions/saveRecipe";
import { toast } from "sonner";
import { formatMealType } from "../../lib/utils/weekHelpers";

interface MealSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayOfWeek | null;
  mealType: MealType | null;
  existingMeal: MealInput | null;
  onSave: (data: Omit<MealInput, "id">) => void;
  onDelete?: () => void;
  onStartCopy?: () => void;
}

const DAY_EMOJIS: Record<string, string> = {
  Monday: "",
  Tuesday: "",
  Wednesday: "",
  Thursday: "",
  Friday: "",
  Saturday: "",
  Sunday: "",
};

const QUICK_FILLS: { label: string; emoji: string }[] = [
  { label: "Leftovers", emoji: "♻️" },
  { label: "Salad", emoji: "🥗" },
  { label: "Soup", emoji: "🍲" },
  { label: "Eggs & Toast", emoji: "🍳" },
  { label: "Sandwich", emoji: "🥪" },
  { label: "Takeout", emoji: "🥡" },
  { label: "Smoothie", emoji: "🥤" },
  { label: "Pasta", emoji: "🍝" },
];

export function MealSlideOver({
  isOpen,
  onClose,
  day,
  mealType,
  existingMeal,
  onSave,
  onDelete,
  onStartCopy,
}: MealSlideOverProps) {
  const [title, setTitle] = useState(existingMeal?.title ?? "");
  const [recipeUrl, setRecipeUrl] = useState(existingMeal?.recipeUrl ?? "");
  const [notes, setNotes] = useState(existingMeal?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [recipeSaved, setRecipeSaved] = useState(false);

  async function handleSaveToRecipes() {
    if (!existingMeal?.recipeUrl || !existingMeal?.title) return;
    setIsSavingRecipe(true);
    try {
      const result = await saveRecipeAction({
        title: existingMeal.title,
        url: existingMeal.recipeUrl,
        notes: existingMeal.notes ?? "",
        tags: [],
      });
      if (result.success) {
        setRecipeSaved(true);
        toast.success("Recipe saved! 🌿");
      } else if (result.limitReached) {
        toast.error("Recipe limit reached", { description: "Upgrade to Pro to save unlimited recipes." });
      } else {
        toast.error(result.error ?? "Couldn't save recipe");
      }
    } finally {
      setIsSavingRecipe(false);
    }
  }

  // Reset form whenever the slide-over opens for a new slot
  useEffect(() => {
    if (isOpen) {
      setTitle(existingMeal?.title ?? "");
      setRecipeUrl(existingMeal?.recipeUrl ?? "");
      setNotes(existingMeal?.notes ?? "");
      setErrors({});
      setRecipeSaved(false);
    }
  }, [isOpen, existingMeal]);

  const panelTitle =
    day && mealType
      ? `${DAY_EMOJIS[day] ?? ""} ${day} ${formatMealType(mealType)}`
      : "Add Meal";

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Please enter a meal name";
    if (recipeUrl && !isValidUrl(recipeUrl)) errs.recipeUrl = "Please enter a valid URL";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!day || !mealType) return;
    onSave({
      dayOfWeek: day,
      mealType,
      title: title.trim(),
      recipeUrl: recipeUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title={panelTitle}>
      <div className="space-y-5">
        {/* Actions row (existing meals only) */}
        {existingMeal && (onDelete || onStartCopy || existingMeal.recipeUrl) && (
          <div className="flex items-center gap-2 flex-wrap">
            {existingMeal.recipeUrl && (
              <a
                href={existingMeal.recipeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-full border border-sage/40 bg-sage-light/20 text-sage-dark hover:bg-sage-light/50 transition-colors"
              >
                <ExternalLink size={11} />
                Open recipe
              </a>
            )}
            {existingMeal.recipeUrl && (
              <button
                type="button"
                onClick={handleSaveToRecipes}
                disabled={isSavingRecipe || recipeSaved}
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-full border transition-colors",
                  recipeSaved
                    ? "border-sage/40 bg-sage-light/30 text-sage-dark cursor-default"
                    : "border-espresso/20 bg-linen text-espresso/70 hover:bg-linen hover:text-espresso",
                ].join(" ")}
              >
                {recipeSaved ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
                {recipeSaved ? "Saved" : "Save to Recipes"}
              </button>
            )}
            {onStartCopy && (
              <button
                type="button"
                onClick={() => { onStartCopy(); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-full border border-espresso/20 bg-linen text-espresso/70 hover:bg-linen hover:text-espresso transition-colors"
              >
                <Copy size={11} />
                Duplicate
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={11} />
                Delete
              </button>
            )}
          </div>
        )}

        <div className="border-t border-rose/10" />

        {/* Quick-fill chips */}
        <div>
          <p className="text-xs font-sans font-medium text-espresso/50 mb-2 uppercase tracking-wider">
            Quick add
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILLS.map(({ label, emoji }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setTitle(label);
                  setErrors((p) => ({ ...p, title: "" }));
                }}
                className={[
                  "px-3 py-1.5 text-xs font-sans rounded-full border transition-all duration-150",
                  title === label
                    ? "bg-espresso text-cream border-espresso"
                    : "bg-cream border-rose/30 text-espresso/70 hover:border-rose hover:bg-rose-light/40",
                ].join(" ")}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-rose/10" />

        {/* Meal name */}
        <Input
          label="Meal name"
          placeholder="e.g. Lemon herb roasted chicken"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((p) => ({ ...p, title: "" }));
          }}
          error={errors.title}
          autoFocus
        />

        {/* Recipe URL */}
        <Input
          label="Recipe URL (optional)"
          placeholder="https://..."
          value={recipeUrl}
          onChange={(e) => {
            setRecipeUrl(e.target.value);
            if (errors.recipeUrl) setErrors((p) => ({ ...p, recipeUrl: "" }));
          }}
          error={errors.recipeUrl}
          hint="Paste a link from any recipe site for more accurate nutrition estimates"
          type="url"
        />

        {/* Notes */}
        <Textarea
          label="Notes (optional)"
          placeholder="Dietary swaps, serving size, prep notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          hint="Any custom instructions or modifications"
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" className="flex-1" onClick={handleSave}>
            Save Meal
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <p className="text-xs text-espresso/40 font-sans text-center leading-relaxed">
          🌿 Even simple meal names work great — shef will estimate nutrition from the name alone.
        </p>
      </div>
    </SlideOver>
  );
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
