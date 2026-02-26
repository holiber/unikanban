import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";

function runDevTuiForMs(ms: number) {
  return new Promise<{ output: string; code: number | null; signal: NodeJS.Signals | null }>(
    (resolve) => {
      const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
      const child = spawn(pnpmCmd, ["run", "--silent", "dev:tui"], {
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: "0" },
        stdio: ["ignore", "pipe", "pipe"],
      });

      let output = "";
      child.stdout.on("data", (buf) => {
        output += buf.toString();
      });
      child.stderr.on("data", (buf) => {
        output += buf.toString();
      });

      const killTimer = setTimeout(() => {
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 250).unref();
      }, ms);
      killTimer.unref();

      child.on("close", (code, signal) => {
        clearTimeout(killTimer);
        resolve({ output, code, signal });
      });
    },
  );
}

describe("dev:tui", () => {
  it("does not crash with React undefined (tsx JSX runtime)", async () => {
    const { output } = await runDevTuiForMs(1500);
    expect(output).not.toMatch(/ReferenceError: React is not defined/);
  });
});

