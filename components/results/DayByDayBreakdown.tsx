import { Accordion } from "../ui/Accordion";
import { Badge } from "../ui/Badge";
import type { MealInput, MealNutrition } from "../../lib/validations/schemas";
import { DAYS_OF_WEEK, MEAL_TYPES } from "../../lib/validations/schemas";
import type { DayOfWeek } from "../../lib/validations/schemas";

interface DayByDayBreakdownProps {
  meals: MealInput[];
  mealNutrition: MealNutrition[];
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: "",
  lunch: "",
  dinner: "",
};

export function DayByDayBreakdown({ meals, mealNutrition }: DayByDayBreakdownProps) {
  const nutritionByMealId = new Map(mealNutrition.map((n) => [n.mealId, n]));

  const days = DAYS_OF_WEEK.filter((day) =>
    meals.some((m) => m.dayOfWeek === day)
  );

  const accordionItems = days.map((day) => {
    const dayMeals = meals.filter((m) => m.dayOfWeek === day);
    const dayCalories = dayMeals.reduce((sum, m) => {
      return sum + (nutritionByMealId.get(m.id)?.calories ?? 0);
    }, 0);

    return {
      id: day,
      title: (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getDayEmoji(day)}</span>
            <span className="font-serif text-lg text-espresso">{day}</span>
            <span className="text-sm text-espresso/50 font-sans">
              {dayMeals.length} meal{dayMeals.length !== 1 ? "s" : ""}
            </span>
          </div>
          {dayCalories > 0 && (
            <span className="text-sm font-sans font-medium text-espresso/70 mr-2">
              ~{Math.round(dayCalories).toLocaleString()} kcal
            </span>
          )}
        </div>
      ),
      content: (
        <div className="space-y-3">
          {MEAL_TYPES.filter((t) => dayMeals.some((m) => m.mealType === t)).map(
            (mealType) => {
              const meal = dayMeals.find((m) => m.mealType === mealType);
              if (!meal) return null;
              const nutrition = nutritionByMealId.get(meal.id);

              return (
                <div
                  key={mealType}
                  className="bg-cream rounded-xl p-4 border border-rose/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{MEAL_EMOJIS[mealType]}</span>
                        <span className="text-[11px] font-sans font-semibold text-espresso/50 uppercase tracking-wider">
                          {mealType}
                        </span>
                      </div>
                      <p className="font-sans font-medium text-espresso text-sm">
                        {meal.title}
                      </p>
                      {meal.recipeUrl && (
                        <a
                          href={meal.recipeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sage hover:text-sage-dark transition-colors mt-0.5 inline-block"
                        >
                          View recipe ↗
                        </a>
                      )}
                    </div>
                    {nutrition && (
                      <div className="text-right flex-shrink-0">
                        <p className="font-serif text-xl text-espresso">
                          {Math.round(nutrition.calories)}
                        </p>
                        <p className="text-xs text-espresso/50 font-sans">kcal</p>
                      </div>
                    )}
                  </div>

                  {nutrition && (
                    <div className="grid grid-cols-3 gap-2">
                      <MacroChip label="Protein" value={nutrition.protein} color="bg-sage-light" />
                      <MacroChip label="Carbs" value={nutrition.carbs} color="bg-rose-light" />
                      <MacroChip label="Fat" value={nutrition.fat} color="bg-linen" />
                    </div>
                  )}

                  {nutrition?.isEstimate && (
                    <div className="mt-2">
                      <Badge variant="estimate">AI estimate</Badge>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl text-espresso">Day by Day</h2>
        <p className="text-sm text-espresso/60 font-sans mt-1">
          Click a day to see all meals and their nutrition
        </p>
      </div>
      <Accordion items={accordionItems} defaultOpenId={days[0]} />
    </div>
  );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 text-center ${color}`}>
      <p className="text-[10px] font-sans text-espresso/60 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-sans font-semibold text-espresso">{Math.round(value)}g</p>
    </div>
  );
}

function getDayEmoji(day: DayOfWeek): string {
  const emojis: Record<DayOfWeek, string> = {
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  };
  return emojis[day];
}
