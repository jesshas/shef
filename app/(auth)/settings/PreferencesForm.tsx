"use client";

import { useState } from "react";
import { updateDietaryPreferencesAction } from "../../../lib/actions/updatePreferences";
import { DIETARY_PREFERENCES } from "../../../lib/validations/schemas";
import { Button } from "../../../components/ui/Button";
import { toast } from "sonner";

const SERVING_OPTIONS = [1, 2, 3, 4, 5] as const;

interface PreferencesFormProps {
  currentPreferences: string[];
  currentServingSize?: number;
}

const PREFERENCE_LABELS: Record<string, string> = {
  vegetarian: "🌱 Vegetarian",
  vegan: "🌿 Vegan",
  "gluten-free": "🌾 Gluten-Free",
  "dairy-free": "🥛 Dairy-Free",
  "low-carb": "🥩 Low-Carb",
  "high-protein": "💪 High-Protein",
  ketogenic: "🔥 Ketogenic",
  "low-fodmap": "🫁 Low FODMAP",
  paleo: "🦴 Paleo",
  "intermittent-fasting": "⏱️ Intermittent Fasting",
  kosher: "✡️ Kosher",
  "diabetes-friendly": "🩺 Diabetes-Friendly",
  "glp-1": "💉 GLP-1",
};

export function PreferencesForm({ currentPreferences, currentServingSize = 1 }: PreferencesFormProps) {
  const [selected, setSelected] = useState<string[]>(currentPreferences);
  const [servingSize, setServingSize] = useState<number>(currentServingSize);
  const [isLoading, setIsLoading] = useState(false);

  function toggle(pref: string) {
    setSelected((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      const result = await updateDietaryPreferencesAction({
        dietaryPreferences: selected,
        servingSize,
      });
      if (result.success) {
        toast.success("Preferences saved! 🌿");
      } else {
        toast.error(result.error ?? "Couldn't save preferences");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Serving size */}
      <div className="mb-8">
        <p className="text-sm font-sans font-medium text-espresso mb-3">
          Planning for how many people?
        </p>
        <div className="flex items-center gap-2">
          {SERVING_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setServingSize(n)}
              className={[
                "w-11 h-11 rounded-xl border text-sm font-sans font-medium transition-all",
                servingSize === n
                  ? "bg-espresso text-cream border-espresso"
                  : "bg-cream text-espresso/70 border-rose/30 hover:border-rose",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setServingSize(6)}
            className={[
              "px-3 h-11 rounded-xl border text-sm font-sans font-medium transition-all",
              servingSize >= 6
                ? "bg-espresso text-cream border-espresso"
                : "bg-cream text-espresso/70 border-rose/30 hover:border-rose",
            ].join(" ")}
          >
            6+
          </button>
        </div>
      </div>

      {/* Dietary preferences */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {DIETARY_PREFERENCES.map((pref) => (
          <button
            key={pref}
            onClick={() => toggle(pref)}
            className={[
              "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-sans transition-all",
              selected.includes(pref)
                ? "bg-espresso text-cream border-espresso"
                : "bg-cream text-espresso/70 border-rose/30 hover:border-rose",
            ].join(" ")}
          >
            <span className="text-base">
              {PREFERENCE_LABELS[pref]?.split(" ")[0]}
            </span>
            <span>{PREFERENCE_LABELS[pref]?.split(" ").slice(1).join(" ") ?? pref}</span>
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        onClick={handleSave}
        isLoading={isLoading}
      >
        Save Preferences
      </Button>
    </div>
  );
}
