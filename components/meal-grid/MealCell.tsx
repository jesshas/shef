"use client";

import { Plus, Pencil, Trash2, ExternalLink, Copy, ClipboardPaste } from "lucide-react";
import type { DayOfWeek, MealInput, MealType } from "../../lib/validations/schemas";

interface MealCellProps {
  day: DayOfWeek;
  mealType: MealType;
  meal?: MealInput;
  onClick: () => void;
  onDelete?: () => void;
  onCopyStart?: () => void;       // enter copy mode with this meal
  onCopyHere?: () => void;        // paste the copied meal into this slot
  isCopySource?: boolean;         // this cell is the one being copied
  isCopyMode?: boolean;           // copy mode is active (another cell is source)
  onQuickAdd?: (title: string) => void; // add meal without opening slide-over
}

export function MealCell({
  meal,
  onClick,
  onDelete,
  onCopyStart,
  onCopyHere,
  isCopySource = false,
  isCopyMode = false,
  onQuickAdd,
}: MealCellProps) {
  // ── Empty cell ──────────────────────────────────────────────────────────────
  if (!meal) {
    // In copy mode: this empty cell is a paste target
    if (isCopyMode && onCopyHere) {
      return (
        <button
          onClick={onCopyHere}
          className="group h-20 w-full rounded-xl border-2 border-dashed border-sage/60 bg-sage-light/20 hover:bg-sage-light/50 hover:border-sage transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-copy"
          aria-label="Paste meal here"
        >
          <ClipboardPaste size={14} className="text-sage-dark group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-sans font-medium text-sage-dark hidden sm:block">Paste here</span>
        </button>
      );
    }

    return (
      <div className="group relative h-20 w-full">
        <button
          onClick={onClick}
          className="h-full w-full rounded-xl border-2 border-dashed border-rose/30 bg-cream hover:border-rose hover:bg-rose-light/30 transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
          aria-label="Add a meal"
        >
          <Plus size={15} className="text-espresso/30 group-hover:text-espresso/60 transition-colors" />
          <span className="text-[9px] font-sans text-espresso/30 group-hover:text-espresso/50 transition-colors hidden sm:block">
            Add meal
          </span>
        </button>

        {/* Leftovers quick-add — visible on hover */}
        {onQuickAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd("Leftovers");
            }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity px-2 py-0.5 text-[9px] font-sans font-medium text-espresso/50 hover:text-espresso bg-linen/80 hover:bg-linen rounded-full border border-rose/20"
            aria-label="Quick-add leftovers"
          >
            ♻️ Leftovers
          </button>
        )}
      </div>
    );
  }

  // ── Filled cell — copy-source highlight ─────────────────────────────────────
  if (isCopySource) {
    return (
      <div className="relative h-20 w-full rounded-xl border-2 border-espresso bg-espresso/5 shadow-md p-2 flex flex-col justify-between overflow-hidden">
        <p className="text-[11px] font-sans font-medium text-espresso leading-tight line-clamp-2">
          {meal.title}
        </p>
        <span className="text-[9px] font-sans text-espresso/50 font-medium">📋 copying…</span>
      </div>
    );
  }

  // ── Filled cell — copy-mode paste target ─────────────────────────────────────
  if (isCopyMode && onCopyHere) {
    return (
      <button
        onClick={onCopyHere}
        className="group relative h-20 w-full rounded-xl border-2 border-dashed border-rose/40 bg-white/50 hover:border-rose hover:bg-rose-light/20 transition-all duration-200 p-2 flex flex-col justify-between overflow-hidden cursor-copy text-left"
        aria-label={`Replace ${meal.title}`}
      >
        <p className="text-[11px] font-sans font-medium text-espresso/40 leading-tight line-clamp-2">
          {meal.title}
        </p>
        <span className="text-[9px] font-sans text-rose-dark font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          ↩ replace
        </span>
      </button>
    );
  }

  // ── Filled cell — normal ─────────────────────────────────────────────────────
  return (
    <div
      onClick={onClick}
      className="group relative h-20 w-full rounded-xl border border-rose/30 bg-white/80 hover:border-rose/60 hover:shadow-sm transition-all duration-200 p-2 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Meal title — full width on mobile, padded right on desktop for hover actions */}
      <p className="text-[11px] font-sans font-medium text-espresso leading-tight line-clamp-2 sm:pr-8">
        {meal.title}
      </p>

      {/* URL indicator */}
      {meal.recipeUrl && (
        <div className="items-center gap-1 mt-auto hidden md:flex">
          <ExternalLink size={9} className="text-sage" />
          <span className="text-[9px] text-sage font-sans hidden">recipe</span>
        </div>
      )}

      {/* Desktop hover actions (absolute overlay, hidden on mobile) */}
      <div className="absolute top-1 right-1 hidden sm:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="p-1 rounded-md bg-linen hover:bg-rose-light text-espresso/60 hover:text-espresso transition-colors"
          aria-label="Edit meal"
        >
          <Pencil size={9} />
        </button>
        {onCopyStart && (
          <button
            onClick={(e) => { e.stopPropagation(); onCopyStart(); }}
            className="p-1 rounded-md bg-linen hover:bg-sage-light text-espresso/60 hover:text-sage-dark transition-colors"
            aria-label="Duplicate meal"
          >
            <Copy size={9} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded-md bg-linen hover:bg-red-100 text-espresso/60 hover:text-red-600 transition-colors"
            aria-label="Delete meal"
          >
            <Trash2 size={9} />
          </button>
        )}
      </div>
    </div>
  );
}
