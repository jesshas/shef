import React from "react";

type BadgeVariant = "default" | "rose" | "sage" | "espresso" | "estimate";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-linen text-espresso border-cream-dark",
  rose: "bg-rose-light text-espresso border-rose",
  sage: "bg-sage-light text-espresso border-sage",
  espresso: "bg-espresso text-cream border-espresso-light",
  estimate: "bg-cream-dark text-espresso/70 border-linen",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium rounded-full border",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
