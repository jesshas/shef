"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

interface GroceryItemProps {
  name: string;
  quantity: string;
  unit: string;
  onEdit?: (updated: { name: string; quantity: string; unit: string }) => void;
  onDelete?: () => void;
}

export function GroceryItem({ name, quantity, unit, onEdit, onDelete }: GroceryItemProps) {
  const [checked, setChecked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name, quantity, unit });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) nameRef.current?.focus();
  }, [editing]);

  function handleConfirm() {
    if (!draft.name.trim()) return;
    onEdit?.(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft({ name, quantity, unit });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2">
        <input
          ref={nameRef}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") handleCancel(); }}
          placeholder="Item name"
          className="flex-1 min-w-0 text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-1 focus:outline-none focus:border-rose"
        />
        <input
          value={draft.quantity}
          onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") handleCancel(); }}
          placeholder="Qty"
          className="w-14 text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-1 focus:outline-none focus:border-rose"
        />
        <input
          value={draft.unit}
          onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") handleCancel(); }}
          placeholder="Unit"
          className="w-14 text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-1 focus:outline-none focus:border-rose"
        />
        <button
          onClick={handleConfirm}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-sage/20 hover:bg-sage/40 text-sage transition-colors"
          aria-label="Confirm"
        >
          <Check size={14} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleCancel}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose/20 text-espresso/40 hover:text-espresso/70 transition-colors"
          aria-label="Cancel"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 py-2 group ${checked ? "grocery-item-checked" : ""}`}>
      {/* Checkbox */}
      <label className="relative flex-shrink-0 cursor-pointer">
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
      </label>

      {/* Item text */}
      <div className={`flex items-baseline gap-2 flex-1 min-w-0 transition-all duration-300 ${checked ? "opacity-40" : ""}`}>
        <span
          className={`font-sans text-sm text-espresso transition-all duration-300 ${
            checked ? "line-through" : ""
          }`}
        >
          {name}
        </span>
        {(quantity || unit) && (
          <span className="text-xs text-espresso/50 font-sans flex-shrink-0">
            {quantity} {unit}
          </span>
        )}
      </div>

      {/* Edit / Delete (shown on hover when editable) */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => setEditing(true)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose/20 text-espresso/30 hover:text-espresso/70 transition-colors"
              aria-label="Edit item"
            >
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose/30 text-espresso/30 hover:text-rose transition-colors"
              aria-label="Delete item"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
