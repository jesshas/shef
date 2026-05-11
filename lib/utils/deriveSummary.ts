import type { MealNutrition } from "../validations/schemas";

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  avgDailyCalories: number;
  avgDailyProtein: number;
  avgDailyCarbs: number;
  avgDailyFat: number;
  avgDailyFiber: number;
  daysWithData: number;
}

/**
 * Derive weekly summary from per-meal nutrition data
 */
export function deriveSummary(mealNutrition: MealNutrition[]): NutritionSummary {
  const totals = mealNutrition.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
      fiber: acc.fiber + (meal.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const daysWithData = 7; // assume 7-day week

  return {
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.protein),
    totalCarbs: Math.round(totals.carbs),
    totalFat: Math.round(totals.fat),
    totalFiber: Math.round(totals.fiber),
    avgDailyCalories: Math.round(totals.calories / daysWithData),
    avgDailyProtein: Math.round(totals.protein / daysWithData),
    avgDailyCarbs: Math.round(totals.carbs / daysWithData),
    avgDailyFat: Math.round(totals.fat / daysWithData),
    avgDailyFiber: Math.round(totals.fiber / daysWithData),
    daysWithData,
  };
}
