"use client";

import { useState } from "react";
import { updateDietaryPreferencesAction } from "../../../lib/actions/updatePreferences";
import { DIETARY_PREFERENCES } from "../../../lib/validations/schemas";
import { Button } from "../../../components/ui/Button";
import { toast } from "sonner";

interface PreferencesFormProps {
  currentPreferences: string[];
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

export function PreferencesForm({ currentPreferences }: PreferencesFormProps) {
  const [selected, setSelected] = useState<string[]>(currentPreferences);
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
