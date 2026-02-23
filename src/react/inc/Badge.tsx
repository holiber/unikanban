import type { BadgeProps, BadgeVariant } from "../../inc/types.js";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-tertiary text-text-secondary",
  brand: "bg-brand-light text-brand",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
};

export function Badge({
  variant = "default",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5
        text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
