import { defineConfig } from "@playwright/test";

const isHuman = process.env.HUMAN === "1";
const isSmoke = process.env.SMOKE === "1";

const E2E = /.*\.e2e\.(ts|js)x?$/;
const SCENARIO = /.*\.scenario\.e2e\.(ts|js)x?$/;

export default defineConfig({
  testDir: "tests",
  timeout: isSmoke ? 30_000 : 60_000,
  expect: { timeout: 5_000 },
  retries: 0,
  fullyParallel: !isHuman,
  forbidOnly: !!process.env.CI,

  use: {
    baseURL: "http://localhost:5173",
    video: "on",
    screenshot: "on",
    trace: isHuman ? "on" : "retain-on-failure",
    viewport: { width: 1280, height: 720 },
    actionTimeout: isSmoke ? 10_000 : 30_000,
  },

  outputDir: ".cache/tests/playwright-results",

  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  projects: [
    { name: "e2e", testMatch: E2E, testIgnore: [SCENARIO] },
    { name: "scenario", testMatch: SCENARIO },
  ],
});
