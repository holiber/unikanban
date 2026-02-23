import { defineConfig } from "@playwright/test";

const E2E = /.*\.e2e\.(ts|js)x?$/;
const SCENARIO = /.*\.scenario\.e2e\.(ts|js)x?$/;

export default defineConfig({
  testDir: "tests",
  projects: [
    { name: "e2e", testMatch: E2E, testIgnore: [SCENARIO] },
    { name: "scenario", testMatch: SCENARIO },
  ],
});
