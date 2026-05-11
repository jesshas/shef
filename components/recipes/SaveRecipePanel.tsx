"use client";

import { useState } from "react";
import { SlideOver } from "../ui/SlideOver";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { saveRecipeAction } from "../../lib/actions/saveRecipe";
import { toast } from "sonner";

interface SaveRecipePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const SUGGESTED_TAGS = [
  "Quick", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free",
  "High-Protein", "Low-Carb", "Comfort Food", "Batch Cook", "Family-Friendly",
];

export function SaveRecipePanel({ isOpen, onClose, onSaved }: SaveRecipePanelProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Please enter a recipe name");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveRecipeAction({ title, url, notes, tags });
      if (result.success) {
        toast.success("Recipe saved! 🌿");
        setTitle("");
        setUrl("");
        setNotes("");
        setTags([]);
        onClose();
        onSaved?.();
      } else if (result.limitReached) {
        toast.error("Recipe limit reached", {
          description: "Upgrade to Pro to save unlimited recipes.",
        });
      } else {
        toast.error(result.error ?? "Couldn't save recipe");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Save New Recipe">
      <div className="space-y-5">
        <Input
          label="Recipe name"
          placeholder="e.g. Lemon herb roasted chicken"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <Input
          label="Recipe URL (optional)"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
        />
        <Textarea
          label="Notes (optional)"
          placeholder="Your modifications, tips, serving suggestions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Tags */}
        <div>
          <p className="text-sm font-sans font-medium text-espresso mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={[
                  "px-3 py-1 text-xs font-sans rounded-full border transition-all",
                  tags.includes(tag)
                    ? "bg-espresso text-cream border-espresso"
                    : "bg-cream text-espresso/60 border-rose/30 hover:border-rose",
                ].join(" ")}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save Recipe
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </SlideOver>
  );
}
