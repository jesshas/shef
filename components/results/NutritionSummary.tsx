import { Card, CardBody, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { MacroBar } from "./MacroBar";
import type { NutritionSummary } from "../../lib/utils/deriveSummary";

interface NutritionSummaryProps {
  summary: NutritionSummary;
}

export function NutritionSummaryView({ summary }: NutritionSummaryProps) {
  const maxProtein = Math.max(summary.totalProtein, 150);
  const maxCarbs = Math.max(summary.totalCarbs, 300);
  const maxFat = Math.max(summary.totalFat, 150);
  const maxFiber = Math.max(summary.totalFiber, 50);

  return (
    <Card animate className="animate-float-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif tracking-tighter text-2xl text-espresso">Weekly Nutrition</h2>
            <p className="text-sm text-espresso/60 font-sans mt-1">
              AI estimates based on your meal plan
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Weekly calories"
            value={`${summary.totalCalories.toLocaleString()}`}
            sub="kcal"
            accent="bg-rose-light"
          />
          <StatCard
            label="Daily avg calories"
            value={`${summary.avgDailyCalories.toLocaleString()}`}
            sub="kcal / day"
            accent="bg-rose-light"
          />
          <StatCard
            label="Daily protein"
            value={`${summary.avgDailyProtein}g`}
            sub="avg per day"
            accent="bg-sage-light"
          />
          <StatCard
            label="Daily fiber"
            value={`${summary.avgDailyFiber}g`}
            sub="avg per day"
            accent="bg-linen"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-sans font-semibold text-espresso/70 uppercase tracking-wider">
            Weekly Macros
          </h3>
          <MacroBar
            label="Protein"
            value={summary.totalProtein}
            maxValue={maxProtein}
            colorClass="bg-sage"
          />
          <MacroBar
            label="Carbohydrates"
            value={summary.totalCarbs}
            maxValue={maxCarbs}
            colorClass="bg-rose"
          />
          <MacroBar
            label="Fat"
            value={summary.totalFat}
            maxValue={maxFat}
            colorClass="bg-espresso-light"
          />
          <MacroBar
            label="Fiber"
            value={summary.totalFiber}
            maxValue={maxFiber}
            colorClass="bg-sage-light"
          />
        </div>
      </CardBody>
    </Card>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${accent}`}>
      <p className="text-[11px] font-sans font-medium text-espresso/60 uppercase tracking-wide leading-tight mb-2">
        {label}
      </p>
      <p className="font-serif tracking-tighter text-2xl text-espresso leading-none">{value}</p>
      <p className="text-xs text-espresso/50 font-sans mt-1">{sub}</p>
    </div>
  );
}
