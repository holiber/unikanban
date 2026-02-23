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

/**
 * Longer pause for moments that need to be clearly visible
 * in video recordings (e.g. showing a state before toggling away).
 */
export async function hold(page: Page, ms = 1500): Promise<void> {
  await page.waitForTimeout(ms);
}

const CURSOR_INIT_SCRIPT = `
{
  const cursor = document.createElement('div');
  cursor.id = 'pw-cursor';
  Object.assign(cursor.style, {
    position: 'fixed',
    zIndex:   '999999',
    width:    '20px',
    height:   '20px',
    pointerEvents: 'none',
    transition: 'transform 0.08s ease-out, background 0.15s',
    transform: 'translate(-50%, -50%)',
  });
  cursor.innerHTML = \`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 1L4 16L8.5 12L13 18L15 17L10.5 11L16 9L4 1Z"
            fill="black" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>
  \`;
  document.documentElement.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}
`;

/**
 * Injects a visible fake mouse cursor that follows pointer movements
 * and animates on click. Call once after page.goto().
 */
export async function showCursor(page: Page): Promise<void> {
  await page.addScriptTag({ content: CURSOR_INIT_SCRIPT });
}
