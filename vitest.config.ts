import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/react/**",
        "src/tui/**",
        "src/inc/useTheme.ts",
        "src/inc/types.ts",
      ],
      reporter: ["text", "text-summary", "json-summary", "json"],
      reportsDirectory: ".cache/coverage",
    },
  },
});
