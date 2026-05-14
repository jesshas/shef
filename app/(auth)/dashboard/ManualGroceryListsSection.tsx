"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { SlideOver } from "../../../components/ui/SlideOver";
import {
  createManualGroceryListAction,
  deleteManualGroceryListAction,
} from "../../../lib/actions/manualGroceryList";
import type { ManualGroceryList } from "../../../lib/db/schema";
import type { GroceryCategory } from "../../../lib/validations/schemas";
import { toast } from "sonner";

interface ManualGroceryListsSectionProps {
  initialLists: ManualGroceryList[];
}

export function ManualGroceryListsSection({ initialLists }: ManualGroceryListsSectionProps) {
  const [lists, setLists] = useState<ManualGroceryList[]>(initialLists);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function itemCount(list: ManualGroceryList): number {
    const categories = list.categories as GroceryCategory[];
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      const result = await createManualGroceryListAction(newTitle);
      if (result.success && result.list) {
        setLists((prev) => [result.list!, ...prev]);
        setNewTitle("");
        setIsCreating(false);
        toast.success("List created!");
      } else {
        toast.error(result.error ?? "Couldn't create list");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteManualGroceryListAction(id);
      if (result.success) {
        setLists((prev) => prev.filter((l) => l.id !== id));
        toast.success("List deleted");
      } else {
        toast.error(result.error ?? "Couldn't delete list");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif tracking-tighter text-2xl text-espresso">My Grocery Lists</h2>
        <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
          <Plus size={14} />
          New List
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="bg-cream border border-rose/20 rounded-2xl px-6 py-10 text-center">
          <ShoppingCart size={28} className="text-espresso/20 mx-auto mb-3" />
          <p className="font-serif tracking-tighter text-lg text-espresso mb-1">No lists yet</p>
          <p className="text-sm text-espresso/50 font-sans mb-5">
            Create a grocery list to share with anyone — no meal plan needed.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={14} />
            Create your first list
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="group flex items-center justify-between bg-cream border border-rose/20 rounded-xl px-5 py-4 hover:border-rose/50 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium text-espresso text-sm truncate">{list.title}</p>
                <p className="text-xs text-espresso/40 font-sans mt-0.5">
                  {itemCount(list)} item{itemCount(list) !== 1 ? "s" : ""}
                  {" · "}
                  {new Date(list.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => handleDelete(list.id)}
                  disabled={isPending}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-espresso/30 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
                  aria-label="Delete list"
                >
                  <Trash2 size={14} />
                </button>
                <Link href={`/lists/${list.id}`}>
                  <div className="flex items-center gap-1.5 px-4 py-3 sm:px-3 sm:py-1.5 rounded-lg bg-espresso text-cream text-xs font-sans hover:bg-espresso/80 transition-colors">
                    Open
                    <ArrowRight size={12} />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create slide-over */}
      <SlideOver isOpen={isCreating} onClose={() => { setIsCreating(false); setNewTitle(""); }} title="New Grocery List">
        <div className="space-y-5">
          <Input
            label="List name"
            placeholder="e.g. Weekly shop, BBQ weekend..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            autoFocus
          />
          <p className="text-xs text-espresso/50 font-sans">
            You can add items after creating the list.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreate}
              isLoading={isPending}
            >
              Create List
            </Button>
            <Button variant="ghost" onClick={() => { setIsCreating(false); setNewTitle(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
