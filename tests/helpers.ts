import { Page } from "@playwright/test";

const isHuman = process.env.HUMAN === "1";
const BREATH_DELAY_MS = 800;

/**
 * Introduces a small delay in "human" execution mode so that
 * actions are watchable in videos. No-op in normal/CI runs.
 */
export async function breath(page: Page, ms = BREATH_DELAY_MS): Promise<void> {
  if (isHuman) {
    await page.waitForTimeout(ms);
  }
}

/**
 * Short pause that always runs — used to let animations settle
 * so video frames capture the final state.
 */
export async function settle(page: Page, ms = 400): Promise<void> {
  await page.waitForTimeout(ms);
}
