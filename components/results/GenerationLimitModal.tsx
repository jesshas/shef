"use client";

import { useClerk } from "@clerk/nextjs";
import { X, Sparkles } from "lucide-react";

interface GenerationLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGuest: boolean;
}

const PERKS = [
  { emoji: "✨", text: "More AI generations on paid plans" },
  { emoji: "💾", text: "Save & revisit all your weekly plans" },
  { emoji: "🥗", text: "Set dietary preferences" },
  { emoji: "📋", text: "Full meal history" },
];

export function GenerationLimitModal({ isOpen, onClose, isGuest }: GenerationLimitModalProps) {
  const { openSignUp, openSignIn } = useClerk();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-cream rounded-3xl shadow-2xl p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-espresso/40 hover:text-espresso hover:bg-linen transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-light/40 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-rose-dark" />
          </div>
          <h2 className="font-serif tracking-tighter text-2xl text-espresso mb-2">
            You&apos;ve used your 4 free generations
          </h2>
          <p className="text-sm font-sans text-espresso/60 leading-relaxed">
            {isGuest
              ? "Create a free account to get more generations and save your plans forever."
              : "Upgrade to Pro for unlimited AI meal planning."}
          </p>
        </div>

        <ul className="space-y-3 mb-8">
          {PERKS.map(({ emoji, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm font-sans text-espresso/70">
              <span className="text-base">{emoji}</span>
              {text}
            </li>
          ))}
        </ul>

        {isGuest ? (
          <div className="space-y-3">
            <button
              onClick={() => { openSignUp(); onClose(); }}
              className="w-full py-3.5 bg-espresso text-cream font-sans font-semibold text-sm rounded-2xl hover:bg-espresso-light transition-colors"
            >
              Create free account
            </button>
            <button
              onClick={() => { openSignIn(); onClose(); }}
              className="w-full py-3 text-espresso/60 font-sans text-sm hover:text-espresso transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-espresso text-cream font-sans font-semibold text-sm rounded-2xl hover:bg-espresso-light transition-colors"
            >
              Join the waitlist for Pro
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-espresso/60 font-sans text-sm hover:text-espresso transition-colors"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
