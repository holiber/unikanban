import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
  children: ReactNode;
}

const sizeClasses = {
  sm: "h-7 w-7 rounded-md",
  md: "h-9 w-9 rounded-lg",
};

export function IconButton({
  label,
  size = "md",
  className = "",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`inline-flex items-center justify-center text-text-secondary
        transition-colors hover:bg-surface-hover hover:text-text-primary
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1
        disabled:pointer-events-none disabled:opacity-50
        ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
