interface MacroBarProps {
  label: string;
  value: number;
  unit?: string;
  maxValue: number;
  colorClass: string;
  bgColorClass?: string;
}

export function MacroBar({
  label,
  value,
  unit = "g",
  maxValue,
  colorClass,
  bgColorClass = "bg-linen",
}: MacroBarProps) {
  const percent = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans font-medium text-espresso/70 capitalize">
          {label}
        </span>
        <span className="text-xs font-sans font-semibold text-espresso">
          {Math.round(value)}{unit}
        </span>
      </div>
      <div className={`h-2 rounded-full ${bgColorClass} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
