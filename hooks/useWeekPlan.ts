"use client";

import { useState, useCallback, useEffect } from "react";
import type { MealInput, DayOfWeek, MealType } from "../lib/validations/schemas";
import { generateLocalId, getCurrentWeekStart } from "../lib/utils/weekHelpers";
import { readGuestPlan, writeGuestPlan } from "../lib/guest/guestStorage";

export interface UseWeekPlanReturn {
  meals: MealInput[];
  weekStartDate: string;
  addMeal: (meal: Omit<MealInput, "id">) => void;
  updateMeal: (id: string, updates: Partial<Omit<MealInput, "id">>) => void;
  deleteMeal: (id: string) => void;
  getMealForSlot: (day: DayOfWeek, mealType: MealType) => MealInput | undefined;
  mealCount: number;
}

/**
 * Hook that manages the weekly meal plan for both guests and signed-in users.
 * For guests, persists to localStorage. For signed-in users, syncs to DB.
 */
export function useWeekPlan(isGuest: boolean): UseWeekPlanReturn {
  const [weekStartDate] = useState(getCurrentWeekStart);
  const [meals, setMeals] = useState<MealInput[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount (guest only)
  useEffect(() => {
    if (isGuest && !loaded) {
      const saved = readGuestPlan();
      if (saved?.meals) {
        setMeals(saved.meals);
      }
      setLoaded(true);
    } else if (!isGuest) {
      setLoaded(true);
    }
  }, [isGuest, loaded]);

  // Persist to localStorage whenever meals change (guest only)
  useEffect(() => {
    if (isGuest && loaded) {
      writeGuestPlan({ weekStartDate, meals });
    }
  }, [isGuest, loaded, meals, weekStartDate]);

  const addMeal = useCallback((meal: Omit<MealInput, "id">) => {
    const newMeal: MealInput = { ...meal, id: generateLocalId() };
    setMeals((prev) => {
      // Replace existing meal for that slot, or add new
      const filtered = prev.filter(
        (m) => !(m.dayOfWeek === meal.dayOfWeek && m.mealType === meal.mealType)
      );
      return [...filtered, newMeal];
    });
  }, []);

  const updateMeal = useCallback(
    (id: string, updates: Partial<Omit<MealInput, "id">>) => {
      setMeals((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  const deleteMeal = useCallback((id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const getMealForSlot = useCallback(
    (day: DayOfWeek, mealType: MealType) => {
      return meals.find((m) => m.dayOfWeek === day && m.mealType === mealType);
    },
    [meals]
  );

  return {
    meals,
    weekStartDate,
    addMeal,
    updateMeal,
    deleteMeal,
    getMealForSlot,
    mealCount: meals.length,
  };
}
