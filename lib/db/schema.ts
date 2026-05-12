import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  plan: text("plan", { enum: ["free", "pro"] })
    .notNull()
    .default("free"),
  dietaryPreferences: jsonb("dietary_preferences")
    .$type<string[]>()
    .default([]),
  generationCount: integer("generation_count").notNull().default(0),
  aiPromptCount: integer("ai_prompt_count").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mealWeeks = pgTable("meal_weeks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekStartDate: text("week_start_date").notNull(), // ISO date string YYYY-MM-DD
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekId: uuid("week_id")
    .notNull()
    .references(() => mealWeeks.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week", {
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  }).notNull(),
  mealType: text("meal_type", {
    enum: ["breakfast", "lunch", "dinner"],
  }).notNull(),
  title: text("title").notNull(),
  recipeUrl: text("recipe_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const weekResults = pgTable("week_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekId: uuid("week_id")
    .notNull()
    .references(() => mealWeeks.id, { onDelete: "cascade" })
    .unique(),
  groceryList: jsonb("grocery_list").notNull(),
  nutritionSummary: jsonb("nutrition_summary").notNull(),
  perMealNutrition: jsonb("per_meal_nutrition").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const savedRecipes = pgTable("saved_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url"),
  notes: text("notes"),
  nutritionSnapshot: jsonb("nutrition_snapshot"),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MealWeek = typeof mealWeeks.$inferSelect;
export type NewMealWeek = typeof mealWeeks.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type WeekResult = typeof weekResults.$inferSelect;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type NewSavedRecipe = typeof savedRecipes.$inferInsert;
