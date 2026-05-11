import { z } from "zod";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

export const DIETARY_PREFERENCES = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "low-carb",
  "high-protein",
] as const;

export const mealSchema = z.object({
  id: z.string(),
  dayOfWeek: z.enum(DAYS_OF_WEEK),
  mealType: z.enum(MEAL_TYPES),
  title: z.string().min(1, "Meal title is required").max(200),
  recipeUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const weekPlanSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  meals: z.array(mealSchema),
});

export const saveMealSchema = z.object({
  weekId: z.string().uuid().optional(),
  meal: mealSchema,
});

export const saveRecipeSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).default([]),
});

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const mealNutritionSchema = z.object({
  mealId: z.string(),
  title: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  sodium: z.number(),
  isEstimate: z.boolean(),
});

export const groceryItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
});

export const groceryCategorySchema = z.object({
  name: z.string(),
  items: z.array(groceryItemSchema),
});

export const weekResultsSchema = z.object({
  mealNutrition: z.array(mealNutritionSchema),
  categories: z.array(groceryCategorySchema),
});

// Types derived from schemas
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type MealType = (typeof MEAL_TYPES)[number];
export type MealInput = z.infer<typeof mealSchema>;
export type WeekPlan = z.infer<typeof weekPlanSchema>;
export type MealNutrition = z.infer<typeof mealNutritionSchema>;
export type GroceryItem = z.infer<typeof groceryItemSchema>;
export type GroceryCategory = z.infer<typeof groceryCategorySchema>;
export type WeekResults = z.infer<typeof weekResultsSchema>;
