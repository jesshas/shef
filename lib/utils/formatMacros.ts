/**
 * Format a macro value for display with a unit
 */
export function formatMacro(value: number, unit = "g"): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${unit}`;
  }
  return `${Math.round(value)}${unit}`;
}

/**
 * Format calories
 */
export function formatCalories(value: number): string {
  return `${Math.round(value).toLocaleString()} kcal`;
}

/**
 * Get percentage of a macro relative to a max value (clamped 0–100)
 */
export function getMacroPercent(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
}

/**
 * Color classes for macros (Tailwind)
 */
export const MACRO_COLORS = {
  protein: {
    bg: "bg-sage",
    text: "text-sage-dark",
    border: "border-sage",
  },
  carbs: {
    bg: "bg-rose",
    text: "text-rose-dark",
    border: "border-rose",
  },
  fat: {
    bg: "bg-espresso",
    text: "text-espresso-light",
    border: "border-espresso",
  },
  fiber: {
    bg: "bg-linen",
    text: "text-espresso-light",
    border: "border-linen",
  },
  calories: {
    bg: "bg-cream-dark",
    text: "text-espresso",
    border: "border-cream-dark",
  },
} as const;
