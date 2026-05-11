"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface GroceryItemProps {
  name: string;
  quantity: string;
  unit: string;
}

export function GroceryItem({ name, quantity, unit }: GroceryItemProps) {
  const [checked, setChecked] = useState(false);

  return (
    <label
      className={`flex items-center gap-3 py-2 cursor-pointer group ${
        checked ? "grocery-item-checked" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only"
        />
        <div
          className={[
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
            checked
              ? "bg-sage border-sage"
              : "border-rose/40 group-hover:border-rose bg-white",
          ].join(" ")}
        >
          {checked && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>
      </div>

      <div className={`flex items-baseline gap-2 flex-1 transition-all duration-300 ${checked ? "opacity-40" : ""}`}>
        <span
          className={`font-sans text-sm text-espresso transition-all duration-300 ${
            checked ? "line-through" : ""
          }`}
        >
          {name}
        </span>
        {quantity && unit && (
          <span className="text-xs text-espresso/50 font-sans flex-shrink-0">
            {quantity} {unit}
          </span>
        )}
      </div>
    </label>
  );
}
