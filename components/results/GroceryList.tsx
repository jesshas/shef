"use client";

import { useState, useCallback } from "react";
import { Copy, Printer, Check, Plus, Save, ShoppingCart } from "lucide-react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { GroceryItem } from "./GroceryItem";
import type { GroceryCategory } from "../../lib/validations/schemas";
import { toast } from "sonner";

interface AddItemRowProps {
  onAdd: (item: { name: string; quantity: string; unit: string }) => void;
  onCancel: () => void;
}

function AddItemRow({ onAdd, onCancel }: AddItemRowProps) {
  const [draft, setDraft] = useState({ name: "", quantity: "", unit: "" });

  function handleConfirm() {
    if (!draft.name.trim()) return;
    onAdd(draft);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-t border-rose/10">
      <input
        autoFocus
        value={draft.name}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onCancel(); }}
        placeholder="Item name"
        className="flex-1 min-w-0 text-base sm:text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-2 sm:py-1 focus:outline-none focus:border-rose"
      />
      <div className="flex items-center gap-2">
        <input
          value={draft.quantity}
          onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onCancel(); }}
          placeholder="Qty"
          className="w-20 sm:w-14 text-base sm:text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-2 sm:py-1 focus:outline-none focus:border-rose"
        />
        <input
          value={draft.unit}
          onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onCancel(); }}
          placeholder="Unit"
          className="w-20 sm:w-14 text-base sm:text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-2 sm:py-1 focus:outline-none focus:border-rose"
        />
        <button
          onClick={handleConfirm}
          disabled={!draft.name.trim()}
          className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-sage/20 hover:bg-sage/40 text-sage transition-colors disabled:opacity-40"
          aria-label="Add item"
        >
          <Check size={14} strokeWidth={2.5} />
        </button>
        <button
          onClick={onCancel}
          className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-rose/20 text-espresso/40 hover:text-espresso/70 transition-colors"
          aria-label="Cancel"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const SUGGESTED_CATEGORIES = [
  "Produce", "Protein", "Dairy", "Grains", "Pantry", "Frozen", "Beverages", "Herbs & Spices", "Other",
];

interface AddCategoryRowProps {
  existingNames: string[];
  onAdd: (name: string) => void;
  onCancel: () => void;
}

function AddCategoryRow({ existingNames, onAdd, onCancel }: AddCategoryRowProps) {
  const [draft, setDraft] = useState("");

  const available = SUGGESTED_CATEGORIES.filter((c) => !existingNames.includes(c));

  function handleConfirm() {
    const name = draft.trim();
    if (!name || existingNames.includes(name)) return;
    onAdd(name);
  }

  return (
    <div className="flex items-center gap-2 pt-4 border-t border-rose/10">
      <input
        autoFocus
        list="category-suggestions"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onCancel(); }}
        placeholder="Section name (e.g. Produce)"
        className="flex-1 min-w-0 text-base sm:text-sm font-sans text-espresso bg-cream border border-rose/40 rounded-lg px-2 py-2 sm:py-1 focus:outline-none focus:border-rose"
      />
      <datalist id="category-suggestions">
        {available.map((c) => <option key={c} value={c} />)}
      </datalist>
      <button
        onClick={handleConfirm}
        disabled={!draft.trim() || existingNames.includes(draft.trim())}
        className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-sage/20 hover:bg-sage/40 text-sage transition-colors disabled:opacity-40"
        aria-label="Add section"
      >
        <Check size={14} strokeWidth={2.5} />
      </button>
      <button
        onClick={onCancel}
        className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-rose/20 text-espresso/40 hover:text-espresso/70 transition-colors"
        aria-label="Cancel"
      >
        ✕
      </button>
    </div>
  );
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Produce: "🥦",
  Protein: "🥩",
  Dairy: "🥛",
  Pantry: "🫙",
  Frozen: "🧊",
  Other: "🛒",
  Grains: "🌾",
  Beverages: "🧃",
  "Herbs & Spices": "🌿",
};

interface GroceryListProps {
  categories: GroceryCategory[];
  onUpdate?: (categories: GroceryCategory[]) => Promise<void>;
  shareButton?: React.ReactNode;
}

export function GroceryList({ categories: initialCategories, onUpdate, shareButton }: GroceryListProps) {
  const [localCategories, setLocalCategories] = useState<GroceryCategory[]>(initialCategories);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const mutate = useCallback((updater: (prev: GroceryCategory[]) => GroceryCategory[]) => {
    setLocalCategories(updater);
    setIsDirty(true);
  }, []);

  function handleEditItem(categoryName: string, itemIdx: number, updated: { name: string; quantity: string; unit: string }) {
    mutate((prev) =>
      prev.map((cat) =>
        cat.name === categoryName
          ? { ...cat, items: cat.items.map((item, i) => (i === itemIdx ? updated : item)) }
          : cat
      )
    );
  }

  function handleDeleteItem(categoryName: string, itemIdx: number) {
    mutate((prev) =>
      prev
        .map((cat) =>
          cat.name === categoryName
            ? { ...cat, items: cat.items.filter((_, i) => i !== itemIdx) }
            : cat
        )
        .filter((cat) => cat.items.length > 0)
    );
  }

  function handleAddItem(categoryName: string, item: { name: string; quantity: string; unit: string }) {
    mutate((prev) =>
      prev.map((cat) =>
        cat.name === categoryName ? { ...cat, items: [...cat.items, item] } : cat
      )
    );
    setAddingTo(null);
  }

  function handleAddCategory(name: string) {
    mutate((prev) => [...prev, { name, items: [] }]);
    setAddingCategory(false);
    setAddingTo(name);
  }

  async function handleSave() {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(localCategories);
      setIsDirty(false);
      toast.success("Grocery list saved!");
    } catch {
      toast.error("Couldn't save grocery list. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function buildPlainText(): string {
    return localCategories
      .map((cat) => {
        const items = cat.items
          .map((i) => `• ${i.name}${i.quantity ? ` — ${i.quantity} ${i.unit}`.trim() : ""}`)
          .join("\n");
        return `${cat.name}\n${items}`;
      })
      .join("\n\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildPlainText());
      setCopied(true);
      toast.success("Grocery list copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  function handlePrint() {
    window.print();
  }

  const totalItems = localCategories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif tracking-tighter text-2xl text-espresso">Grocery List</h2>
            <p className="text-sm text-espresso/60 font-sans mt-1">
              {totalItems} items across {localCategories.length} categories
            </p>
          </div>
          <div className="flex gap-2 flex-wrap sm:justify-end">
            {shareButton}
            {onUpdate && isDirty && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
              >
                {!isSaving && <Save size={14} />}
                Save changes
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <><Check size={14} className="text-sage" />Copied!</>
              ) : (
                <><Copy size={14} />Copy</>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint}>
              <Printer size={14} />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {localCategories.length === 0 && !addingCategory && (
          <div className="text-center py-10">
            <ShoppingCart size={28} className="text-espresso/20 mx-auto mb-3" />
            <p className="font-serif tracking-tighter text-lg text-espresso mb-1">Empty list</p>
            <p className="text-sm text-espresso/50 font-sans mb-5">Add a section to start building your list.</p>
            {onUpdate && (
              <button
                onClick={() => setAddingCategory(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-medium bg-espresso text-cream rounded-xl hover:bg-espresso/80 transition-colors"
              >
                <Plus size={14} />
                Add section
              </button>
            )}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-6">
          {localCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg leading-none">
                  {CATEGORY_EMOJIS[category.name] ?? "🛒"}
                </span>
                <h3 className="font-serif tracking-tighter text-base leading-none text-espresso">
                  {category.name}
                </h3>
                <span className="text-xs text-espresso/40 font-sans">
                  ({category.items.length})
                </span>
              </div>
              <div className="divide-y divide-rose/10 pl-1">
                {category.items.map((item, idx) => (
                  <GroceryItem
                    key={`${category.name}-${idx}`}
                    name={item.name}
                    quantity={item.quantity}
                    unit={item.unit}
                    onEdit={onUpdate ? (updated) => handleEditItem(category.name, idx, updated) : undefined}
                    onDelete={onUpdate ? () => handleDeleteItem(category.name, idx) : undefined}
                  />
                ))}
              </div>

              {/* Add item row / trigger */}
              {onUpdate && (
                addingTo === category.name ? (
                  <AddItemRow
                    onAdd={(item) => handleAddItem(category.name, item)}
                    onCancel={() => setAddingTo(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingTo(category.name)}
                    className="flex items-center gap-1.5 mt-2 pl-1 py-2 text-xs font-sans text-espresso/40 hover:text-espresso/70 transition-colors"
                  >
                    <Plus size={12} />
                    Add item
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        {/* Add section */}
        {onUpdate && localCategories.length > 0 && (
          addingCategory ? (
            <AddCategoryRow
              existingNames={localCategories.map((c) => c.name)}
              onAdd={handleAddCategory}
              onCancel={() => setAddingCategory(false)}
            />
          ) : (
            <button
              onClick={() => setAddingCategory(true)}
              className="flex items-center gap-1.5 mt-4 py-2 text-xs font-sans text-espresso/40 hover:text-espresso/70 transition-colors"
            >
              <Plus size={12} />
              Add section
            </button>
          )
        )}

        {onUpdate && localCategories.length === 0 && addingCategory && (
          <AddCategoryRow
            existingNames={[]}
            onAdd={handleAddCategory}
            onCancel={() => setAddingCategory(false)}
          />
        )}
      </CardBody>
    </Card>
  );
}
