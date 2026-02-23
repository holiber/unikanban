import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface IconButtonProps {
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export type BadgeVariant = "default" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export interface InputProps {
  label?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onEscape?: () => void;
  className?: string;
}

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}
