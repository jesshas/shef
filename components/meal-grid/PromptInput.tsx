"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";

interface PromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  promptsUsed: number;
  promptLimit: number;
  isPro: boolean;
}

const MIN_LENGTH = 60;

const PLACEHOLDER = `e.g. "I'm training for a half marathon and need high-protein meals. I love Mediterranean food, cook 3-4 nights a week, and have about 30 minutes on weeknights. Family of 2, one person is dairy-free."`;

const PROMPT_HINTS = [
  "Cuisine style (Mediterranean, Asian, Mexican…)",
  "Cooking time available",
  "Skill level or equipment",
  "Serving size / family size",
  "Health goals or restrictions",
];

export function PromptInput({ onGenerate, isLoading, promptsUsed, promptLimit, isPro }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const remaining = Math.max(0, promptLimit - promptsUsed);
  const canUse = isPro || remaining > 0;
  const isReady = prompt.trim().length >= MIN_LENGTH && canUse && !isLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReady) return;
    await onGenerate(prompt.trim());
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white/60 border border-rose/30 rounded-2xl text-left hover:border-espresso/20 hover:bg-white/80 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-light/40 flex items-center justify-center shrink-0 group-hover:bg-rose-light/60 transition-colors">
          <Wand2 size={16} className="text-rose-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm text-espresso">
            Let AI plan your week
          </p>
          <p className="text-xs text-espresso/50 font-sans mt-0.5">
            Describe what you want — shef fills the whole grid
            {!isPro && (
              <span className="ml-1.5 text-espresso/40">
                · {remaining} free use{remaining !== 1 ? "s" : ""} remaining
              </span>
            )}
          </p>
        </div>
        <span className="text-xs font-sans font-semibold px-2.5 py-1 bg-rose/20 text-rose-dark rounded-lg shrink-0">
          {isPro ? "Pro" : remaining > 0 ? "Free" : "Upgrade"}
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/60 border border-rose/30 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-light/40 flex items-center justify-center">
            <Wand2 size={14} className="text-rose-dark" />
          </div>
          <span className="font-sans font-semibold text-sm text-espresso">Let AI plan your week</span>
        </div>
        {!isPro && (
          <span className="text-xs font-sans text-espresso/40">
            {remaining} free use{remaining !== 1 ? "s" : ""} remaining
          </span>
        )}
      </div>

      {/* Hints */}
      <div className="flex flex-wrap gap-1.5">
        {PROMPT_HINTS.map((hint) => (
          <span
            key={hint}
            className="text-[11px] font-sans px-2.5 py-1 bg-linen border border-rose/20 rounded-lg text-espresso/50"
          >
            {hint}
          </span>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={4}
          disabled={!canUse || isLoading}
          className="w-full resize-none rounded-xl border border-rose/30 bg-cream px-4 py-3 text-sm font-sans text-espresso placeholder:text-espresso/30 focus:outline-none focus:border-espresso/30 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
        />
        <span
          className={`absolute bottom-3 right-3 text-[11px] font-sans tabular-nums ${
            prompt.trim().length >= MIN_LENGTH ? "text-sage-dark" : "text-espresso/30"
          }`}
        >
          {prompt.trim().length}/{MIN_LENGTH}
        </span>
      </div>

      {!canUse && !isPro && (
        <div className="flex items-center justify-between text-xs font-sans bg-linen rounded-xl px-4 py-3">
          <span className="text-espresso/60">You&apos;ve used your free AI prompt.</span>
          <a href="/pricing" className="font-semibold text-espresso hover:underline">
            Upgrade to Pro →
          </a>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isReady}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-espresso text-cream font-sans font-semibold text-sm rounded-xl hover:bg-espresso-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Planning your week…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate meal ideas
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="px-4 py-3 text-espresso/50 font-sans text-sm hover:text-espresso transition-colors"
        >
          Cancel
        </button>
      </div>

      <p className="text-[11px] text-espresso/30 font-sans text-center">
        AI suggestions fill the grid — you can edit any meal afterwards
      </p>
    </form>
  );
}
