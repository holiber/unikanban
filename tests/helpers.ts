import { Locator, Page } from "@playwright/test";

const isHuman = process.env.HUMAN === "1";
const isRecordings = process.env.RECORDINGS === "1";
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

type CursorMoveOptions = {
  steps?: number;
  stepDelayMs?: number;
};

const cursorPos = new WeakMap<Page, { x: number; y: number }>();

function defaultCursorMoveOptions(): Required<CursorMoveOptions> {
  if (isHuman) return { steps: 18, stepDelayMs: 20 };
  if (isRecordings) return { steps: 12, stepDelayMs: 16 };
  return { steps: 6, stepDelayMs: 0 };
}

export async function cursorMoveTo(
  page: Page,
  x: number,
  y: number,
  opts: CursorMoveOptions = {},
): Promise<void> {
  const { steps, stepDelayMs } = { ...defaultCursorMoveOptions(), ...opts };
  const from = cursorPos.get(page) ?? { x: 0, y: 0 };

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const nx = from.x + (x - from.x) * t;
    const ny = from.y + (y - from.y) * t;
    await page.mouse.move(nx, ny);
    if (stepDelayMs > 0) await page.waitForTimeout(stepDelayMs);
  }

  cursorPos.set(page, { x, y });
}

export async function cursorMoveToLocator(
  page: Page,
  locator: Locator,
  opts: CursorMoveOptions = {},
): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    // Fallback when the element is not currently measurable.
    await locator.hover();
    return;
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await cursorMoveTo(page, x, y, opts);
}

export async function cursorHover(
  page: Page,
  locator: Locator,
  opts: CursorMoveOptions = {},
): Promise<void> {
  await cursorMoveToLocator(page, locator, opts);
  await locator.hover();
}

export async function cursorClick(
  page: Page,
  locator: Locator,
  opts: CursorMoveOptions = {},
): Promise<void> {
  await cursorMoveToLocator(page, locator, opts);
  // Click via mouse so the injected cursor ring animates.
  await page.mouse.down();
  if (isHuman || isRecordings) await page.waitForTimeout(30);
  await page.mouse.up();
}

const CURSOR_INIT_SCRIPT = `
{
  const cursor = document.createElement('div');
  cursor.id = 'pw-cursor';
  Object.assign(cursor.style, {
    position: 'fixed',
    zIndex:   '999999',
    width:    '40px',
    height:   '40px',
    pointerEvents: 'none',
    left: '-100px',
    top:  '-100px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
  });
  cursor.innerHTML = \`
    <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 1L3 19L8.5 13.5L13 22L16 20.5L11.5 12L18 10L3 1Z"
            fill="#FF3B30" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
  \`;
  document.documentElement.appendChild(cursor);

  const ring = document.createElement('div');
  ring.id = 'pw-cursor-ring';
  Object.assign(ring.style, {
    position: 'fixed',
    zIndex:   '999998',
    width:    '32px',
    height:   '32px',
    borderRadius: '50%',
    border:   '2px solid rgba(255, 59, 48, 0.5)',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.15s, height 0.15s, border-color 0.15s',
    left: '-100px',
    top:  '-100px',
  });
  document.documentElement.appendChild(ring);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    ring.style.left   = e.clientX + 'px';
    ring.style.top    = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    ring.style.width  = '20px';
    ring.style.height = '20px';
    ring.style.borderColor = 'rgba(255, 59, 48, 0.9)';
  });
  document.addEventListener('mouseup', () => {
    ring.style.width  = '32px';
    ring.style.height = '32px';
    ring.style.borderColor = 'rgba(255, 59, 48, 0.5)';
  });
}
`;

/**
 * Injects a large, brightly-colored fake mouse cursor (red arrow + ring)
 * that follows pointer movements and animates on click.
 * Call once after page.goto() or page.reload().
 */
export async function showCursor(page: Page): Promise<void> {
  await page.addScriptTag({ content: CURSOR_INIT_SCRIPT });
  await cursorMoveTo(page, 640, 360);
  await page.waitForTimeout(100);
}
