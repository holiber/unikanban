import { Text } from "ink";
import type { BadgeProps, BadgeVariant } from "../../inc/types.js";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "./theme-colors.js";

const variantColorKey: Record<BadgeVariant, keyof ReturnType<typeof colors>> = {
  default: "textDim",
  brand: "brand",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  const { theme } = useTheme();
  const c = colors(theme);
  const color = c[variantColorKey[variant]];

  return (
    <Text color={color}>
      [{children}]
    </Text>
  );
}
