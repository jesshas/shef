import type { MealInput } from "../validations/schemas";
import { getCurrentWeekStart } from "../utils/weekHelpers";

const STORAGE_KEY = "mealmuse_guest_plan";
const GENERATION_COUNT_KEY = "mealmuse_guest_generation_count";
const AI_PROMPT_COUNT_KEY = "mealmuse_guest_ai_prompt_count";

export interface GuestPlan {
  weekStartDate: string;
  meals: MealInput[];
  savedAt: string;
}

/**
 * Read the guest plan from localStorage
 */
export function readGuestPlan(): GuestPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestPlan;
  } catch {
    return null;
  }
}

/**
 * Write the guest plan to localStorage
 */
export function writeGuestPlan(plan: Omit<GuestPlan, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: GuestPlan = { ...plan, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Clear the guest plan from localStorage
 */
export function clearGuestPlan(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get a fresh guest plan structure for the current week
 */
export function getEmptyGuestPlan(): GuestPlan {
  return {
    weekStartDate: getCurrentWeekStart(),
    meals: [],
    savedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Guest generation counter
// ---------------------------------------------------------------------------

export function getGuestGenerationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(GENERATION_COUNT_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function incrementGuestGenerationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const next = getGuestGenerationCount() + 1;
    localStorage.setItem(GENERATION_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Guest AI prompt counter
// ---------------------------------------------------------------------------

export function getGuestAiPromptCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(AI_PROMPT_COUNT_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function incrementGuestAiPromptCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const next = getGuestAiPromptCount() + 1;
    localStorage.setItem(AI_PROMPT_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}
