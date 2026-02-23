import type { InputProps } from "../../inc/types.js";

export function Input({
  label,
  id,
  placeholder,
  value,
  autoFocus,
  onChange,
  onSubmit,
  onEscape,
  className = "",
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.(value ?? "");
          if (e.key === "Escape") onEscape?.();
        }}
        className={`rounded-lg border border-border-primary bg-surface-primary
          px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary
          transition-colors focus:border-border-accent focus:outline-none
          focus:ring-2 focus:ring-brand/30 ${className}`}
      />
    </div>
  );
}
