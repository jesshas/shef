import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "rose" | "sage";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-espresso text-cream hover:bg-espresso-light border border-espresso hover:shadow-md",
  secondary:
    "bg-cream border border-rose text-espresso hover:bg-rose-light hover:border-rose-dark",
  ghost:
    "bg-transparent text-espresso hover:bg-linen border border-transparent hover:border-rose",
  rose: "bg-rose text-espresso hover:bg-rose-dark hover:text-cream border border-rose",
  sage: "bg-sage text-cream hover:bg-sage-dark border border-sage",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        "inline-flex items-center justify-center gap-2 font-sans font-medium",
        "transition-all duration-200 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2",
        "hover:-translate-y-0.5 active:translate-y-0",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
