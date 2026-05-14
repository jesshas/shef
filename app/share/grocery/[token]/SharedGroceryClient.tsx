"use client";

import { GroceryList } from "../../../../components/results/GroceryList";
import { SignUpGate } from "../../../../components/share/SignUpGate";
import { updateSharedGroceryListAction } from "../../../../lib/actions/shareTokens";
import { formatWeekRange } from "../../../../lib/utils/weekHelpers";
import type { GroceryCategory } from "../../../../lib/validations/schemas";

interface SharedGroceryClientProps {
  token: string;
  categories: GroceryCategory[];
  weekStartDate: string | null;
  isLoggedIn: boolean;
}

export function SharedGroceryClient({ token, categories, weekStartDate, isLoggedIn }: SharedGroceryClientProps) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-rose/20 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-serif text-2xl tracking-tighter text-espresso">shef</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-sans text-espresso/50">Shared grocery list</p>
            {weekStartDate && (
              <p className="text-xs font-sans font-medium text-espresso/70">
                {formatWeekRange(weekStartDate)}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Title — always visible */}
        <div className="mb-6">
          <h1 className="font-serif tracking-tighter text-3xl text-espresso mb-1">
            Grocery List
          </h1>
          <p className="text-sm text-espresso/50 font-sans">
            Check off items as you shop, or add what you need.
          </p>
        </div>

        {/* List — gated for guests */}
        <SignUpGate isLoggedIn={isLoggedIn} returnTo={`/share/grocery/${token}`}>
          <GroceryList
            categories={categories}
            onUpdate={async (updated) => {
              const res = await updateSharedGroceryListAction({ token, categories: updated });
              if (!res.success) throw new Error(res.error);
            }}
          />
        </SignUpGate>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs text-espresso/30 font-sans hover:text-espresso/60 transition-colors"
          >
            Plan your own week with shef →
          </a>
        </div>
      </main>
    </div>
  );
}
