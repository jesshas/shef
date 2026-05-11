import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-sans font-medium text-espresso">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full px-4 py-2.5 rounded-xl bg-white border font-sans text-sm text-espresso",
          "placeholder:text-espresso/40",
          "focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose",
          "transition-colors duration-200",
          error ? "border-red-300 bg-red-50/30" : "border-rose/30 hover:border-rose/60",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-espresso/50 font-sans">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-sans">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = "", id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-sans font-medium text-espresso">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={[
          "w-full px-4 py-2.5 rounded-xl bg-white border font-sans text-sm text-espresso resize-none",
          "placeholder:text-espresso/40",
          "focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose",
          "transition-colors duration-200",
          error ? "border-red-300" : "border-rose/30 hover:border-rose/60",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-espresso/50 font-sans">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-sans">{error}</p>
      )}
    </div>
  );
}
