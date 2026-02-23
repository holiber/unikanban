import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border border-border-primary bg-surface-primary
          px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary
          transition-colors focus:border-border-accent focus:outline-none
          focus:ring-2 focus:ring-brand/30 ${className}`}
        {...props}
      />
    </div>
  );
}
