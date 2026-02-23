import { Text } from "ink";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "./theme-colors.js";

export function ThemeToggle() {
  const { theme } = useTheme();
  const c = colors(theme);
  const icon = theme === "light" ? "☀" : "☾";

  return (
    <Text color={c.textDim}>
      {icon} {theme}
    </Text>
  );
}
