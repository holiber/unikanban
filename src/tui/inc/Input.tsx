import { Box, Text, useInput } from "ink";
import type { InputProps } from "../../inc/types.js";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "./theme-colors.js";

export function Input({
  label,
  placeholder,
  value = "",
  onChange,
  onSubmit,
  onEscape,
}: InputProps) {
  const { theme } = useTheme();
  const c = colors(theme);

  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value);
      return;
    }
    if (key.escape) {
      onEscape?.();
      return;
    }
    if (key.backspace || key.delete) {
      onChange?.(value.slice(0, -1));
      return;
    }
    if (input && !key.ctrl && !key.meta) {
      onChange?.(value + input);
    }
  });

  const displayText = value || placeholder || "";
  const isEmpty = !value;

  return (
    <Box flexDirection="column">
      {label && (
        <Text color={c.text} bold>
          {label}
        </Text>
      )}
      <Box>
        <Text color={c.brand}>{"❯ "}</Text>
        <Text color={isEmpty ? c.textMuted : c.text}>{displayText}</Text>
        <Text color={c.brand}>▌</Text>
      </Box>
    </Box>
  );
}
