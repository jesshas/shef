"use client";

import { useState, useRef, useTransition } from "react";
import { Sparkles, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { WeekGrid } from "../../../components/meal-grid/WeekGrid";
import { MealSlideOver } from "../../../components/meal-grid/MealSlideOver";
import { ResultsView } from "../../../components/results/ResultsView";
import { useMealSlideOver } from "../../../hooks/useMealSlideOver";
import { generateWeekPlanAction } from "../../../lib/actions/generateWeekPlan";
import { updateGroceryListAction } from "../../../lib/actions/updateGroceryList";
import { createGroceryShareTokenAction } from "../../../lib/actions/shareTokens";
import { ShareButton } from "../../../components/ui/ShareButton";
import { formatWeekRange, getNextWeekStart, getPrevWeekStart } from "../../../lib/utils/weekHelpers";
import { updateWeekDateAction } from "../../../lib/actions/updateWeek";
import type {
  WeekResults,
  MealInput,
  DayOfWeek,
  MealType,
} from "../../../lib/validations/schemas";
import type { MealWeek, Meal, WeekResult } from "../../../lib/db/schema";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface WeekPlanViewProps {
  week: MealWeek;
  meals: Meal[];
  savedResults: WeekResult | null;
  userId: string;
  servingSize: number;
}

export function WeekPlanView({ week, meals: initialMeals, savedResults, userId, servingSize }: WeekPlanViewProps) {
  const [weekStartDate, setWeekStartDate] = useState(week.weekStartDate);
  const [isChangingWeek, setIsChangingWeek] = useState(false);

  async function handleWeekChange(newStart: string) {
    setIsChangingWeek(true);
    try {
      const res = await updateWeekDateAction(week.id, newStart);
      if (res.success) {
        setWeekStartDate(newStart);
      } else {
        toast.error(res.error ?? "Couldn't update week.");
      }
    } catch {
      toast.error("Couldn't update week.");
    } finally {
      setIsChangingWeek(false);
    }
  }

  // Convert DB meals to MealInput format
  const [meals] = useState<MealInput[]>(
    initialMeals.map((m) => ({
      id: m.id,
      dayOfWeek: m.dayOfWeek as DayOfWeek,
      mealType: m.mealType as MealType,
      title: m.title,
      recipeUrl: m.recipeUrl ?? undefined,
      notes: m.notes ?? undefined,
    }))
  );

  const [copyingMeal, setCopyingMeal] = useState<MealInput | null>(null);

  // Initialize results from saved DB data if available
  const [results, setResults] = useState<WeekResults | null>(() => {
    if (savedResults) {
      return {
        mealNutrition: savedResults.perMealNutrition as WeekResults["mealNutrition"],
        categories: savedResults.groceryList as WeekResults["categories"],
      };
    }
    return null;
  });

  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { slideOver, openSlideOver, closeSlideOver } = useMealSlideOver();

  const mealCount = meals.length;
  const canGenerate = mealCount >= 3;

  function getMealForSlot(day: DayOfWeek, mealType: MealType) {
    return meals.find((m) => m.dayOfWeek === day && m.mealType === mealType);
  }

  function handleGenerate() {
    if (!canGenerate) return;
    startTransition(async () => {
      const loadingToastId = toast.loading("✨ Generating your week...");
      try {
        const result = await generateWeekPlanAction({ meals, weekId: week.id });
        toast.dismiss(loadingToastId);
        if (result.success && result.results) {
          setResults(result.results);
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          toast.success("Plan updated! 🌿");
        } else {
          toast.error(result.error ?? "Something went wrong.");
        }
      } catch {
        toast.dismiss(loadingToastId);
        toast.error("Couldn't generate your plan.");
      }
    });
  }

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-sans font-semibold text-espresso/50 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={12} className="text-sage" />
            Saved to your account
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleWeekChange(getPrevWeekStart(weekStartDate))}
            disabled={isChangingWeek}
            aria-label="Previous week"
            className="p-1.5 rounded-lg text-espresso/40 hover:text-espresso hover:bg-linen transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-serif tracking-tighter text-4xl sm:text-5xl text-espresso mb-2">
            {formatWeekRange(weekStartDate)}
          </h1>
          <button
            onClick={() => handleWeekChange(getNextWeekStart(weekStartDate))}
            disabled={isChangingWeek}
            aria-label="Next week"
            className="p-1.5 rounded-lg text-espresso/40 hover:text-espresso hover:bg-linen transition-colors disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <p className="text-espresso/60 font-sans">
          {mealCount} meal{mealCount !== 1 ? "s" : ""} planned
        </p>
      </div>

      <div className="mb-10">
        <WeekGrid
          getMealForSlot={getMealForSlot}
          onCellClick={openSlideOver}
          onDeleteMeal={() => {}}
          onQuickAdd={() => {}}
          onDuplicateMeal={() => {}}
          copyingMeal={copyingMeal}
          onSetCopyingMeal={setCopyingMeal}
        />
      </div>

      <div className="flex flex-col items-center gap-3 py-8 border-t border-rose/20">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isPending}
          className={[
            "inline-flex items-center gap-3 px-10 py-5 font-sans font-semibold text-lg rounded-2xl transition-all duration-300",
            canGenerate && !isPending
              ? "bg-espresso text-cream hover:bg-espresso-light hover:-translate-y-1 hover:shadow-xl shadow-md cursor-pointer"
              : "bg-linen text-espresso/40 cursor-not-allowed",
          ].join(" ")}
        >
          {isPending ? (
            <>
              <span className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              {results ? "Regenerate My Week" : "Generate My Week"}
            </>
          )}
        </button>
        {results && (
          <button
            onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1 text-sm text-espresso/50 hover:text-espresso font-sans transition-colors"
          >
            <ChevronDown size={16} />
            Scroll to results
          </button>
        )}
      </div>

      <div ref={resultsRef}>
        {results && (
          <ResultsView
            results={results}
            meals={meals}
            isGuest={false}
            onGuestPromptDismiss={() => {}}
            servingSize={servingSize}
            groceryShareButton={
              <ShareButton
                label="Share grocery list"
                shareUrlPath="/share/grocery"
                onGetToken={async () => {
                  const res = await createGroceryShareTokenAction(week.id);
                  if (!res.success || !res.token) throw new Error(res.error);
                  return res.token;
                }}
              />
            }
            onGroceryUpdate={async (categories) => {
              const res = await updateGroceryListAction({ weekId: week.id, categories });
              if (!res.success) throw new Error(res.error);
              setResults((prev) => prev ? { ...prev, categories } : prev);
            }}
          />
        )}
      </div>

      <MealSlideOver
        isOpen={slideOver.isOpen}
        onClose={closeSlideOver}
        day={slideOver.day}
        mealType={slideOver.mealType}
        existingMeal={slideOver.existingMeal}
        onSave={() => {
          closeSlideOver();
          toast.info("Meal editing is available when planning a new week.");
        }}
      />
    </div>
  );
}
