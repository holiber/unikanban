import type { Theme } from "../../inc/types.js";

interface ColorPalette {
  text: string;
  textDim: string;
  textMuted: string;
  bg: string;
  bgAlt: string;
  border: string;
  brand: string;
  danger: string;
  success: string;
  warning: string;
}

const light: ColorPalette = {
  text: "#0f172a",
  textDim: "#475569",
  textMuted: "#94a3b8",
  bg: "#ffffff",
  bgAlt: "#f1f5f9",
  border: "#e2e8f0",
  brand: "#3b82f6",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

const dark: ColorPalette = {
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  bg: "#0f172a",
  bgAlt: "#1e293b",
  border: "#334155",
  brand: "#60a5fa",
  danger: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
};

export function colors(theme: Theme): ColorPalette {
  return theme === "dark" ? dark : light;
}
