import { DAYS_OF_WEEK, type DayOfWeek, type MealInput } from "../validations/schemas";

/**
 * Get the Monday of the current week as an ISO date string (YYYY-MM-DD)
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = (day === 0 ? -6 : 1) - day; // adjust to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

/**
 * Get the Monday of a given week containing `date`
 */
export function getWeekStart(date: Date): string {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

/**
 * Format a week start date for display, e.g. "May 5 – May 11, 2026"
 */
export function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  });
  const yearFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(start)} – ${yearFormatter.format(end)}`;
}

/**
 * Get meals for a specific day from a flat list of meals
 */
export function getMealsForDay(meals: MealInput[], day: DayOfWeek) {
  return meals.filter((m) => m.dayOfWeek === day);
}

/**
 * Count the total number of meals in the plan
 */
export function countMeals(meals: MealInput[]): number {
  return meals.length;
}

/**
 * Get display label for a day
 */
export function getDayLabel(day: DayOfWeek): string {
  return day.slice(0, 3).toUpperCase();
}

/**
 * Get short day label for mobile
 */
export function getDayShort(day: DayOfWeek): string {
  return day.slice(0, 3);
}

/**
 * Get all days of the week
 */
export function getDaysOfWeek(): DayOfWeek[] {
  return [...DAYS_OF_WEEK];
}

/**
 * Return the Monday that is 7 days after the given week start date
 */
export function getNextWeekStart(weekStartDate: string): string {
  const date = new Date(weekStartDate + "T00:00:00");
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
}

/**
 * Return the Monday that is 7 days before the given week start date
 */
export function getPrevWeekStart(weekStartDate: string): string {
  const date = new Date(weekStartDate + "T00:00:00");
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
}

/**
 * Format meal type for display
 */
export function formatMealType(mealType: string): string {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

/**
 * Generate a simple local ID for guest meals
 */
export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
