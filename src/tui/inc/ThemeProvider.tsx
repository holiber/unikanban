import { useCallback, useState, type ReactNode } from "react";
import type { Theme } from "../../inc/types.js";
import { ThemeContext } from "../../inc/useTheme.js";

export function ThemeProvider({
  initial = "dark",
  children,
}: {
  initial?: Theme;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initial);

  const toggle = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );

  return (
    <ThemeContext value={{ theme, toggle }}>
      {children}
    </ThemeContext>
  );
}
