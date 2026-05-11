"use client";

import { X } from "lucide-react";
import { DAYS_OF_WEEK, MEAL_TYPES } from "../../lib/validations/schemas";
import type { DayOfWeek, MealType, MealInput } from "../../lib/validations/schemas";
import { MealCell } from "./MealCell";
import { getDayLabel, getDayShort } from "../../lib/utils/weekHelpers";

interface WeekGridProps {
  getMealForSlot: (day: DayOfWeek, mealType: MealType) => MealInput | undefined;
  onCellClick: (day: DayOfWeek, mealType: MealType, existingMeal?: MealInput) => void;
  onDeleteMeal: (id: string) => void;
  /** Direct add without slide-over (used for Leftovers quick-add) */
  onQuickAdd: (day: DayOfWeek, mealType: MealType, title: string) => void;
  /** Copy a meal's data into a different slot */
  onDuplicateMeal: (source: MealInput, targetDay: DayOfWeek, targetMealType: MealType) => void;
  /** Controlled copy state — lifted to parent so the slide-over can also trigger it */
  copyingMeal: MealInput | null;
  onSetCopyingMeal: (meal: MealInput | null) => void;
}

const MEAL_TYPE_LABELS: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "" },
  lunch: { label: "Lunch", emoji: "" },
  dinner: { label: "Dinner", emoji: "" },
};

export function WeekGrid({
  getMealForSlot,
  onCellClick,
  onDeleteMeal,
  onQuickAdd,
  onDuplicateMeal,
  copyingMeal,
  onSetCopyingMeal,
}: WeekGridProps) {
  function handleCopyHere(day: DayOfWeek, mealType: MealType) {
    if (!copyingMeal) return;
    onDuplicateMeal(copyingMeal, day, mealType);
    onSetCopyingMeal(null);
  }

  return (
    <div className="w-full">
      {/* Copy-mode banner */}
      {copyingMeal && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-espresso/5 border border-espresso/20 rounded-xl animate-fade-in">
          <p className="text-sm font-sans text-espresso">
            <span className="font-medium">📋 Copying</span>{" "}
            <span className="italic text-espresso/70">&ldquo;{copyingMeal.title}&rdquo;</span>
            {" "}— click any slot to paste
          </p>
          <button
            onClick={() => onSetCopyingMeal(null)}
            className="flex items-center gap-1 text-xs font-sans text-espresso/50 hover:text-espresso transition-colors px-2 py-1 rounded-lg hover:bg-linen"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      )}

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div />
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center">
                <span className="hidden md:block text-xs font-sans font-semibold text-espresso/60 uppercase tracking-wider">
                  {getDayLabel(day)}
                </span>
                <span className="block md:hidden text-xs font-sans font-semibold text-espresso/60 uppercase tracking-wider">
                  {getDayShort(day).slice(0, 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
              {/* Meal type label */}
              <div className="flex items-center justify-end pr-2 sm:pr-3">
                <div className="text-right">
                  <div className="text-base leading-none">{MEAL_TYPE_LABELS[mealType].emoji}</div>
                  <div className="text-[10px] font-sans font-medium text-espresso/50 mt-0.5">
                    {MEAL_TYPE_LABELS[mealType].label}
                  </div>
                </div>
              </div>

              {/* Cells */}
              {DAYS_OF_WEEK.map((day) => {
                const meal = getMealForSlot(day, mealType);
                const isSource =
                  copyingMeal !== null &&
                  copyingMeal.dayOfWeek === day &&
                  copyingMeal.mealType === mealType;

                return (
                  <MealCell
                    key={`${day}-${mealType}`}
                    day={day}
                    mealType={mealType}
                    meal={meal}
                    isCopyMode={copyingMeal !== null && !isSource}
                    isCopySource={isSource}
                    onClick={() => !copyingMeal && onCellClick(day, mealType, meal)}
                    onDelete={meal && !copyingMeal ? () => onDeleteMeal(meal.id) : undefined}
                    onCopyStart={meal && !copyingMeal ? () => onSetCopyingMeal(meal) : undefined}
                    onCopyHere={copyingMeal && !isSource ? () => handleCopyHere(day, mealType) : undefined}
                    onQuickAdd={!meal && !copyingMeal ? (title) => onQuickAdd(day, mealType, title) : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
