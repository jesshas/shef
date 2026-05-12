"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { X, Heart } from "lucide-react";
import { Button } from "../ui/Button";

interface GuestSavePromptProps {
  onDismiss: () => void;
}

export function GuestSavePrompt({ onDismiss }: GuestSavePromptProps) {
  const { openSignUp } = useClerk();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss();
  }

  function handleSave() {
    openSignUp();
  }

  return (
    <div className="relative bg-gradient-to-r from-rose-light to-cream border border-rose/40 rounded-2xl p-6 shadow-sm animate-slide-up">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-espresso/40 hover:text-espresso hover:bg-rose/20 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-8">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <Heart size={22} className="text-rose-dark fill-rose-light" />
        </div>

        {/* Copy */}
        <div className="flex-1">
          <p className="font-serif tracking-tighter text-lg text-espresso leading-snug">
            Love your plan?
          </p>
          <p className="text-sm text-espresso/70 font-sans mt-1 leading-relaxed">
            Create a free account to save it, access it anywhere, and plan future weeks. Set dietary preferences, serving sizes, and save at the grocery store - no card required.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {["💾 Save & revisit your plans", "🥗 Set dietary preferences", "📋 Full history"].map((perk) => (
              <span key={perk} className="text-xs text-espresso/50 font-sans">{perk}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            className="flex-1 sm:flex-initial"
          >
            Save My Plan — It&apos;s Free
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={handleDismiss}
            className="text-espresso/50"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
