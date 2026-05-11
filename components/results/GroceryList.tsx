"use client";

import { useState } from "react";
import { Copy, Printer, Check } from "lucide-react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { GroceryItem } from "./GroceryItem";
import type { GroceryCategory } from "../../lib/validations/schemas";
import { toast } from "sonner";

interface GroceryListProps {
  categories: GroceryCategory[];
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

export function GroceryList({ categories }: GroceryListProps) {
  const [copied, setCopied] = useState(false);

  function buildPlainText(): string {
    return categories
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

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif tracking-tighter text-2xl text-espresso">Grocery List</h2>
            <p className="text-sm text-espresso/60 font-sans mt-1">
              {totalItems} items across {categories.length} categories
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-sage" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
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
        <div className="grid sm:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">
                  {CATEGORY_EMOJIS[category.name] ?? "🛒"}
                </span>
                <h3 className="font-serif tracking-tighter text-base text-espresso">
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
