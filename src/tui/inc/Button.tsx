import { Box, Text } from "ink";
import type { ButtonProps, ButtonVariant } from "../../inc/types.js";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "./theme-colors.js";

const variantColorKey: Record<ButtonVariant, keyof ReturnType<typeof colors>> = {
  primary: "brand",
  secondary: "textDim",
  ghost: "textMuted",
  danger: "danger",
};

export function Button({ variant = "primary", children }: ButtonProps) {
  const { theme } = useTheme();
  const c = colors(theme);
  const color = c[variantColorKey[variant]];

  return (
    <Box>
      <Text color={color} bold={variant === "primary"}>
        [{children}]
      </Text>
    </Box>
  );
}
