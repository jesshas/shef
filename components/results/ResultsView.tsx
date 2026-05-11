"use client";

import { NutritionSummaryView } from "./NutritionSummary";
import { DayByDayBreakdown } from "./DayByDayBreakdown";
import { GroceryList } from "./GroceryList";
import { GuestSavePrompt } from "./GuestSavePrompt";
import type { WeekResults, MealInput } from "../../lib/validations/schemas";
import { deriveSummary } from "../../lib/utils/deriveSummary";

interface ResultsViewProps {
  results: WeekResults;
  meals: MealInput[];
  isGuest: boolean;
  onGuestPromptDismiss: () => void;
}

export function ResultsView({
  results,
  meals,
  isGuest,
  onGuestPromptDismiss,
}: ResultsViewProps) {
  const summary = deriveSummary(results.mealNutrition);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Section header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-light/50 rounded-full mb-4">
          <span>✨</span>
          <span className="text-xs font-sans font-semibold text-espresso/70 uppercase tracking-wider">
            Your Week is Ready
          </span>
        </div>
        <h2 className="font-serif tracking-tighter text-3xl sm:text-4xl text-espresso">
          Here&apos;s your plan
        </h2>
        <p className="text-espresso/60 font-sans mt-2">
          Scroll down to see your grocery list and nutrition breakdown
        </p>
      </div>

      {/* Nutrition Summary */}
      <NutritionSummaryView summary={summary} />

      {/* Day-by-Day Breakdown */}
      <DayByDayBreakdown meals={meals} mealNutrition={results.mealNutrition} />

      {/* Guest Save Prompt (before grocery list) */}
      {isGuest && (
        <GuestSavePrompt onDismiss={onGuestPromptDismiss} />
      )}

      {/* Grocery List */}
      <GroceryList categories={results.categories} />
    </div>
  );
}
