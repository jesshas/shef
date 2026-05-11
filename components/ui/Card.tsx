import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", hover = false, animate = false, style }: CardProps) {
  return (
    <div
      style={style}
      className={[
        "bg-cream border border-rose/30 rounded-2xl shadow-sm",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-rose/50 cursor-pointer",
        animate && "animate-float-in",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 pt-6 pb-4 border-b border-rose/20 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-rose/20 ${className}`}>
      {children}
    </div>
  );
}
