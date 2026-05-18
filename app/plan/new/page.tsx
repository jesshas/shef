"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Sparkles, ChevronDown, Share2 } from "lucide-react";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { WeekGrid } from "../../../components/meal-grid/WeekGrid";
import { MealSlideOver } from "../../../components/meal-grid/MealSlideOver";
import { ResultsView } from "../../../components/results/ResultsView";
import { GenerationLimitModal } from "../../../components/results/GenerationLimitModal";
import { useWeekPlan } from "../../../hooks/useWeekPlan";
import { useMealSlideOver } from "../../../hooks/useMealSlideOver";
import { useGuestPlan } from "../../../hooks/useGuestPlan";
import { generateWeekPlanAction } from "../../../lib/actions/generateWeekPlan";
import { generateMealsFromPromptAction } from "../../../lib/actions/generateMealsFromPrompt";
import { createGroceryShareTokenAction } from "../../../lib/actions/shareTokens";
import { ShareButton } from "../../../components/ui/ShareButton";
import { formatWeekRange } from "../../../lib/utils/weekHelpers";
import {
  getGuestGenerationCount,
  incrementGuestGenerationCount,
  getGuestAiPromptCount,
  incrementGuestAiPromptCount,
} from "../../../lib/guest/guestStorage";
import { FREE_LIMITS, AI_PROMPT_LIMIT } from "../../../lib/utils/checkLimit";
import { PromptInput } from "../../../components/meal-grid/PromptInput";
import type { WeekResults, MealInput } from "../../../lib/validations/schemas";
import { toast } from "sonner";

// Loading skeleton for the results section
function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 bg-rose-light/30 rounded-2xl" />
      <div className="h-96 bg-linen rounded-2xl" />
      <div className="h-48 bg-cream-dark/50 rounded-2xl" />
    </div>
  );
}

export default function PlanNewPage() {
  const { isSignedIn } = useUser();
  const { isGuest, importedWeekId } = useGuestPlan();
  const [results, setResults] = useState<WeekResults | null>(null);
  const [savedWeekId, setSavedWeekId] = useState<string | undefined>(undefined);
  const [servingSize, setServingSize] = useState(1);
  const [guestServingSize, setGuestServingSize] = useState(1);
  const [guestPromptDismissed, setGuestPromptDismissed] = useState(false);
  const [copyingMeal, setCopyingMeal] = useState<MealInput | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [aiPromptsUsed, setAiPromptsUsed] = useState(0);
  const [isPromptPending, setIsPromptPending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Hydrate guest counters from localStorage
  useEffect(() => {
    if (!isSignedIn) {
      setGenerationsUsed(getGuestGenerationCount());
      setAiPromptsUsed(getGuestAiPromptCount());
    }
  }, [isSignedIn]);

  // When a guest plan is imported on sign-in, adopt the created weekId so
  // subsequent generations update that week instead of creating a new one.
  useEffect(() => {
    if (importedWeekId) setSavedWeekId(importedWeekId);
  }, [importedWeekId]);

  const {
    meals,
    weekStartDate,
    addMeal,
    updateMeal,
    deleteMeal,
    getMealForSlot,
    mealCount,
  } = useWeekPlan(isGuest);

  const { slideOver, openSlideOver, closeSlideOver } = useMealSlideOver();

  const canGenerate = mealCount >= 3;
  const generationLimit = FREE_LIMITS.generations;
  const generationsRemaining = Math.max(0, generationLimit - generationsUsed);
  // isPro isn't available client-side without a separate fetch, so we optimistically
  // allow use and let the server action enforce the limit for signed-in users
  const isPro = false; // server enforces; set to true only if you pass plan from server

  async function handlePromptGenerate(prompt: string) {
    setIsPromptPending(true);
    const loadingToastId = toast.loading("✨ Shef is planning your week…", {
      description: "Writing your full meal plan from scratch",
    });
    try {
      const result = await generateMealsFromPromptAction({
        userPrompt: prompt,
        guestAiPromptCount: isSignedIn ? undefined : aiPromptsUsed,
      });
      toast.dismiss(loadingToastId);

      if (result.success && result.meals) {
        // Replace all meals in the grid
        result.meals.forEach((m) => {
          addMeal({
            dayOfWeek: m.dayOfWeek,
            mealType: m.mealType,
            title: m.title,
            notes: m.notes,
          });
        });

        if (!isSignedIn) {
          incrementGuestAiPromptCount();
          setAiPromptsUsed(getGuestAiPromptCount());
        }

        toast.success("Your week is filled! Review and generate nutrition + grocery list. 🌿");
      } else if (result.errorCode === "prompt_limit") {
        setShowLimitModal(true);
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.dismiss(loadingToastId);
      toast.error("Couldn't generate meal ideas. Check your connection and try again.");
    } finally {
      setIsPromptPending(false);
    }
  }

  function handleGenerate() {
    if (!canGenerate) return;

    // Client-side limit check for guests (before spending a round-trip)
    if (!isSignedIn && generationsUsed >= generationLimit) {
      setShowLimitModal(true);
      return;
    }

    startTransition(async () => {
      const loadingToastId = toast.loading("✨ Shef is planning your week...", {
        description: "Analyzing your meals and building your grocery list",
      });

      try {
        const result = await generateWeekPlanAction({
          meals,
          weekId: savedWeekId,
          guestGenerationCount: isSignedIn ? undefined : generationsUsed,
          guestServingSize: isSignedIn ? undefined : guestServingSize,
        });

        toast.dismiss(loadingToastId);

        if (result.success && result.results) {
          setResults(result.results);
          if (result.weekId) setSavedWeekId(result.weekId);
          if (result.servingSize) setServingSize(result.servingSize);
          else if (!isSignedIn) setServingSize(guestServingSize);

          // Update generation counts
          if (!isSignedIn) {
            incrementGuestGenerationCount();
            setGenerationsUsed(getGuestGenerationCount());
          } else if (result.generationsUsed !== undefined) {
            setGenerationsUsed(result.generationsUsed);
          }

          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);

          toast.success("Your week is ready! 🌿");
        } else if (result.errorCode === "generation_limit") {
          setShowLimitModal(true);
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.dismiss(loadingToastId);
        toast.error("Couldn't generate your plan. Check your connection and try again.");
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold text-espresso/50 uppercase tracking-wider">
              Weekly Planner
            </span>
          </div>
          <h1 className="font-serif tracking-tighter text-4xl sm:text-5xl text-espresso mb-2">
            Plan your week
          </h1>
          <p className="text-espresso/60 font-sans">
            {formatWeekRange(weekStartDate)} ·{" "}
            {mealCount === 0 ? (
              <span className="italic">No meals yet — let&apos;s fill this week with something delicious 🍳</span>
            ) : (
              <span>
                {mealCount} meal{mealCount !== 1 ? "s" : ""} planned
                {!canGenerate && ` — add ${3 - mealCount} more to generate`}
              </span>
            )}
          </p>

          {!isSignedIn && (
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm font-sans text-espresso/60">Cooking for</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setGuestServingSize((n) => Math.max(1, n - 1))}
                  aria-label="Decrease serving size"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-espresso/20 text-espresso/60 hover:text-espresso hover:border-espresso/40 transition-colors text-sm font-sans"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-sans font-semibold text-espresso tabular-nums">
                  {guestServingSize}
                </span>
                <button
                  onClick={() => setGuestServingSize((n) => Math.min(20, n + 1))}
                  aria-label="Increase serving size"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-espresso/20 text-espresso/60 hover:text-espresso hover:border-espresso/40 transition-colors text-sm font-sans"
                >
                  +
                </button>
              </div>
              <span className="text-sm font-sans text-espresso/60">
                {guestServingSize === 1 ? "person" : "people"}
              </span>
            </div>
          )}
        </div>

        {/* AI Prompt Input */}
        <div className="mb-6">
          <PromptInput
            onGenerate={handlePromptGenerate}
            isLoading={isPromptPending}
            promptsUsed={aiPromptsUsed}
            promptLimit={AI_PROMPT_LIMIT}
            isPro={isPro}
          />
        </div>

        {/* Meal Grid */}
        <div className="md:mb-10 mb-0">
          <WeekGrid
            getMealForSlot={getMealForSlot}
            onCellClick={openSlideOver}
            onDeleteMeal={deleteMeal}
            onQuickAdd={(day, mealType, title) => addMeal({ dayOfWeek: day, mealType, title })}
            onDuplicateMeal={(source, targetDay, targetMealType) =>
              addMeal({ dayOfWeek: targetDay, mealType: targetMealType, title: source.title, recipeUrl: source.recipeUrl, notes: source.notes })
            }
            copyingMeal={copyingMeal}
            onSetCopyingMeal={setCopyingMeal}
          />
        </div>

        {/* Generate CTA */}
        <div className="flex flex-col items-center gap-3 py-8 border-t border-rose/20">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isPending}
            className={[
              "group inline-flex items-center gap-3 px-10 py-5 font-sans font-semibold text-lg rounded-2xl transition-all duration-300",
              canGenerate && !isPending
                ? "bg-espresso text-cream hover:bg-espresso-light hover:-translate-y-1 hover:shadow-xl shadow-espresso/20 shadow-md cursor-pointer"
                : "bg-linen text-espresso/40 cursor-not-allowed shadow-none",
            ].join(" ")}
          >
            {isPending ? (
              <>
                <span className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                Generating your week...
              </>
            ) : (
              <>
                <Sparkles size={20} className={canGenerate ? "text-rose group-hover:rotate-12 transition-transform" : ""} />
               Generate My Week
              </>
            )}
          </button>

          {!canGenerate && mealCount < 3 && (
            <p className="text-xs text-espresso/40 font-sans">
              Add at least {3 - mealCount} more meal{3 - mealCount !== 1 ? "s" : ""} to unlock generation
            </p>
          )}

          {/* Generation counter */}
          {generationsRemaining <= 2 && (
            <p className={`text-xs font-sans ${
              generationsRemaining === 0 ? "text-red-500" : "text-espresso/40"
            }`}>
              {generationsRemaining === 0
                ? "No generations remaining — upgrade to continue"
                : `${generationsRemaining} free generation${generationsRemaining !== 1 ? "s" : ""} remaining`
              }
            </p>
          )}

          {results && !isPending && (
            <button
              onClick={() =>
                resultsRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-1 text-sm text-espresso/50 hover:text-espresso font-sans transition-colors mt-2"
            >
              <ChevronDown size={16} />
              Scroll to your results
            </button>
          )}
        </div>

        {/* Results section */}
        <div ref={resultsRef} className="mt-4">
          {isPending && <ResultsSkeleton />}
          {!isPending && results && (
            <ResultsView
              results={results}
              meals={meals}
              isGuest={isGuest && !isSignedIn}
              onGuestPromptDismiss={() => setGuestPromptDismissed(true)}
              servingSize={servingSize}
              groceryShareButton={
                isSignedIn && savedWeekId ? (
                  <ShareButton
                    label="Share grocery list"
                    shareUrlPath="/share/grocery"
                    onGetToken={async () => {
                      const res = await createGroceryShareTokenAction(savedWeekId);
                      if (!res.success || !res.token) throw new Error(res.error);
                      return res.token;
                    }}
                  />
                ) : !isSignedIn ? (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-full border border-espresso/20 bg-linen text-espresso/70 hover:text-espresso hover:border-espresso/40 transition-colors"
                  >
                    <Share2 size={11} />
                    Share grocery list
                  </Link>
                ) : undefined
              }
              onGroceryUpdate={async (categories) => {
                setResults((prev) => prev ? { ...prev, categories } : prev);
              }}
            />
          )}
        </div>
      </main>

      {/* Meal slide-over */}
      <MealSlideOver
        isOpen={slideOver.isOpen}
        onClose={closeSlideOver}
        day={slideOver.day}
        mealType={slideOver.mealType}
        existingMeal={slideOver.existingMeal}
        onSave={(data) => {
          if (slideOver.existingMeal) {
            updateMeal(slideOver.existingMeal.id, data);
          } else {
            addMeal(data);
          }
        }}
        onDelete={slideOver.existingMeal ? () => { deleteMeal(slideOver.existingMeal!.id); closeSlideOver(); } : undefined}
        onStartCopy={slideOver.existingMeal ? () => { setCopyingMeal(slideOver.existingMeal!); closeSlideOver(); } : undefined}
      />

      <GenerationLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        isGuest={!isSignedIn}
      />

      <Footer />
    </div>
  );
}
