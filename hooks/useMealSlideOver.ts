"use client";

import { useState, useCallback } from "react";
import type { DayOfWeek, MealInput, MealType } from "../lib/validations/schemas";

export interface SlideOverState {
  isOpen: boolean;
  day: DayOfWeek | null;
  mealType: MealType | null;
  existingMeal: MealInput | null;
}

export interface UseMealSlideOverReturn {
  slideOver: SlideOverState;
  openSlideOver: (day: DayOfWeek, mealType: MealType, existingMeal?: MealInput) => void;
  closeSlideOver: () => void;
}

const INITIAL_STATE: SlideOverState = {
  isOpen: false,
  day: null,
  mealType: null,
  existingMeal: null,
};

export function useMealSlideOver(): UseMealSlideOverReturn {
  const [slideOver, setSlideOver] = useState<SlideOverState>(INITIAL_STATE);

  const openSlideOver = useCallback(
    (day: DayOfWeek, mealType: MealType, existingMeal?: MealInput) => {
      setSlideOver({ isOpen: true, day, mealType, existingMeal: existingMeal ?? null });
    },
    []
  );

  const closeSlideOver = useCallback(() => {
    setSlideOver(INITIAL_STATE);
  }, []);

  return { slideOver, openSlideOver, closeSlideOver };
}
