import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";

const rootDir = join(import.meta.dirname, "..");

function tryStatMtimeMs(path: string): number | null {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return null;
  }
}

function findLatestPlaywrightResultsDir(): string | null {
  const candidates: { dir: string; mtimeMs: number }[] = [];
  const testsRoot = join(rootDir, ".cache/tests");
  if (!existsSync(testsRoot)) return null;

  for (const entry of readdirSync(testsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pwOut = join(testsRoot, entry.name, "pw-output");
    const m = tryStatMtimeMs(pwOut);
    if (m != null) candidates.push({ dir: pwOut, mtimeMs: m });
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.dir ?? null;
}

async function runCmd(
  cmd: string,
  args: string[],
  opts?: { timeoutMs?: number; env?: Record<string, string | undefined>; stdin?: string },
): Promise<{ code: number | null; output: string }> {
  return await new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: rootDir,
      env: { ...process.env, ...(opts?.env ?? {}) },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (b) => (output += b.toString()));
    child.stderr.on("data", (b) => (output += b.toString()));

    if (opts?.stdin) {
      child.stdin.write(opts.stdin);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    const timer =
      opts?.timeoutMs != null
        ? setTimeout(() => {
            child.kill("SIGTERM");
            setTimeout(() => child.kill("SIGKILL"), 250).unref();
          }, opts.timeoutMs)
        : null;
    timer?.unref?.();

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code, output });
    });
  });
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function textToPng(outPath: string, title: string, text: string): Promise<void> {
  mkdirSync(dirname(outPath), { recursive: true });

  const browser = await chromium.launch({
    args: process.env.CI ? ["--no-sandbox"] : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        background: #0b1020;
        color: #e6edf3;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      }
      header {
        padding: 14px 18px;
        background: #111a33;
        border-bottom: 1px solid rgba(230,237,243,0.1);
        font-size: 14px;
        font-weight: 600;
      }
      pre {
        margin: 0;
        padding: 16px 18px;
        font-size: 14px;
        line-height: 1.35;
        white-space: pre-wrap;
        word-break: break-word;
      }
    </style>
  </head>
  <body>
    <header>${escapeHtml(title)}</header>
    <pre>${escapeHtml(text)}</pre>
  </body>
</html>
`;

  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
}

const pwOutDir = findLatestPlaywrightResultsDir() ?? join(rootDir, ".cache/tests/test-scenario/pw-output");
mkdirSync(pwOutDir, { recursive: true });

const cliDir = join(pwOutDir, "cli");
const tuiDir = join(pwOutDir, "tui");
mkdirSync(cliDir, { recursive: true });
mkdirSync(tuiDir, { recursive: true });

console.log(`Writing CLI/TUI artifacts into: ${pwOutDir}`);

// CLI: help output
{
  const { output } = await runCmd("pnpm", ["run", "--silent", "cli", "--", "--help"], {
    env: { FORCE_COLOR: "0" },
    timeoutMs: 10_000,
  });
  const txtPath = join(cliDir, "help.txt");
  const pngPath = join(cliDir, "help.png");
  writeFileSync(txtPath, output);
  await textToPng(pngPath, "CLI: --help", output);
}

// CLI: interactive transcript (commands + events)
{
  const stdin = [
    ".help",
    ".events on board:created",
    'board create --title "GH Pages artifacts board"',
    "board list",
    ".events off board:created",
    ".exit",
    "",
  ].join("\n");

  const { output } = await runCmd("pnpm", ["run", "--silent", "cli", "--", "--interactive"], {
    env: { FORCE_COLOR: "0" },
    timeoutMs: 15_000,
    stdin,
  });
  const txtPath = join(cliDir, "interactive.txt");
  const pngPath = join(cliDir, "interactive.png");
  writeFileSync(txtPath, output);
  await textToPng(pngPath, "CLI: interactive mode", output);
}

// TUI: capture initial render (best-effort; Ink may warn without a TTY)
{
  const { output } = await runCmd("pnpm", ["run", "--silent", "dev:tui"], {
    env: { FORCE_COLOR: "0" },
    timeoutMs: 2_000,
  });
  const txtPath = join(tuiDir, "render.txt");
  const pngPath = join(tuiDir, "render.png");
  writeFileSync(txtPath, output);
  await textToPng(pngPath, "TUI: initial render (non-interactive capture)", output);
}

