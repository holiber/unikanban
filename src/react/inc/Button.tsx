import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-text-inverse hover:bg-brand-hover focus:ring-brand",
  secondary:
    "bg-surface-secondary text-text-primary border border-border-primary hover:bg-surface-hover focus:ring-brand",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:ring-brand",
  danger:
    "bg-danger text-white hover:bg-red-600 focus:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded-md",
  md: "px-3.5 py-1.5 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:pointer-events-none disabled:opacity-50
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
