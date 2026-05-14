"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Pencil, Check, X } from "lucide-react";
import { GroceryList } from "../../../../components/results/GroceryList";
import { ShareButton } from "../../../../components/ui/ShareButton";
import { Button } from "../../../../components/ui/Button";
import {
  updateManualGroceryListAction,
  createManualGroceryShareTokenAction,
} from "../../../../lib/actions/manualGroceryList";
import type { ManualGroceryList } from "../../../../lib/db/schema";
import type { GroceryCategory } from "../../../../lib/validations/schemas";
import { toast } from "sonner";

interface ManualListClientProps {
  list: ManualGroceryList;
}

export function ManualListClient({ list }: ManualListClientProps) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [isPending, startTransition] = useTransition();

  const categories = (list.categories as GroceryCategory[]) ?? [];

  async function handleSaveCategories(updated: GroceryCategory[]) {
    const result = await updateManualGroceryListAction({ id: list.id, categories: updated });
    if (!result.success) throw new Error(result.error);
  }

  function handleSaveTitle() {
    if (!titleDraft.trim()) { setTitleDraft(list.title); setIsEditingTitle(false); return; }
    startTransition(async () => {
      const result = await updateManualGroceryListAction({ id: list.id, title: titleDraft });
      if (result.success) {
        toast.success("Title updated");
      } else {
        toast.error(result.error ?? "Couldn't update title");
        setTitleDraft(list.title);
      }
      setIsEditingTitle(false);
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-rose/20 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-espresso/60 hover:text-espresso font-sans transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") { setTitleDraft(list.title); setIsEditingTitle(false); } }}
                className="flex-1 font-serif tracking-tighter text-xl text-espresso bg-transparent border-b border-espresso/30 focus:border-espresso focus:outline-none pb-0.5"
              />
              <button onClick={handleSaveTitle} disabled={isPending} className="text-sage hover:text-sage/80 transition-colors">
                <Check size={16} strokeWidth={2.5} />
              </button>
              <button onClick={() => { setTitleDraft(list.title); setIsEditingTitle(false); }} className="text-espresso/40 hover:text-espresso/70 transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 group flex-1"
            >
              <h1 className="font-serif tracking-tighter text-xl text-espresso group-hover:text-espresso/70 transition-colors truncate">
                {titleDraft}
              </h1>
              <Pencil size={13} className="text-espresso/30 group-hover:text-espresso/60 shrink-0 transition-colors" />
            </button>
          )}

          <ShareButton
            label="Share"
            shareUrlPath="/share/list"
            onGetToken={async () => {
              const res = await createManualGroceryShareTokenAction(list.id);
              if (!res.success || !res.token) throw new Error(res.error);
              return res.token;
            }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <GroceryList
          categories={categories}
          onUpdate={handleSaveCategories}
        />
      </main>
    </div>
  );
}
