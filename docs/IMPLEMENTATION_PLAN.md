## Implementation Plan for Issue #1: Init the repo

After researching the [jabterm](https://github.com/holiber/jabterm) project structure, testing strategy, and the goals outlined in this issue, here is a step-by-step implementation plan.

---

### Phase 1: Project Scaffolding

**Step 1.1 — Initialize Node.js project**
- Create `package.json` with `"type": "module"`, `pnpm` as package manager
- Set up TypeScript config (`tsconfig.base.json`) following jabterm's conventions (ES2022 target, ESNext module, bundler moduleResolution, strict mode)
- Create `.gitignore` (node_modules, dist, .cache, *.tsbuildinfo, .env, test-results, playwright-report)
- Choose `pnpm` as the package manager (consistent with jabterm)

**Step 1.2 — Install core dev dependencies**
- `typescript` (^5)
- `vitest` (^3) — for unit tests
- `@playwright/test` (^1.58) — for e2e/scenario tests
- `yargs` (^18) + `@types/yargs` — for CLI (also a runtime dep)
- `jabtrunner` — from jabterm GitHub releases (test runner)

---

### Phase 2: Copy AGENTS.md & agents/ from jabterm

**Step 2.1 — Create `AGENTS.md`** at repo root:
```md
# Agents

If you are an AI agent (or automation) working on this repository, follow the test contract described in:

- [`agents/testing-strategy.md`](agents/testing-strategy.md)
```

Updated to include a link to `docs/GOALS.md` so agents understand the project vision:
```md
## Project Goals

See [`docs/GOALS.md`](docs/GOALS.md) for the vision and architecture.
```

**Step 2.2 — Create `agents/testing-strategy.md`**
- Copy verbatim from jabterm (the testing strategy is designed to be repo-agnostic)
- It defines the test commands contract, test types (unit/e2e/scenario/integration), smoke rules, human execution mode, artifact conventions, and tooling recommendations

---

### Phase 3: Create docs/GOALS.md

**Step 3.1 — Write `docs/GOALS.md`** with the following content derived from the issue description:

Key sections to include:
1. **Project Overview** — UniKanban: a Kanban board built with the "Unapi" pattern
2. **What is Unapi** — A way of describing APIs for services, UI widgets, and forms in a self-documented way. Single source of truth for API docs and types
3. **Core Principles**:
   - CLI as thin wrapper around the API with auto-generated `--help` via yargs
   - TypeScript apps always have correct types (tRPC-like end-to-end type safety)
   - MCP server as thin wrapper around the API
   - OpenAPI / AsyncAPI doc generation from the same source
   - Transport agnostic (HTTP, stdio, IPC)
   - Streaming capabilities (pub/sub, not just request/response)
4. **Modes of Operation**:
   - Headless mode (Node.js) — programmatic usage by importing the client lib
   - Headed mode — Browser UI and TUI (terminal UI)
   - CLI interface — send commands via terminal
5. **Architecture Vision** — how the Unapi layer sits between transports and business logic

**Step 3.2 — Link from AGENTS.md** (covered in Step 2.1 above)

---

### Phase 4: Set Up the Test Runner & Test Scripts

**Step 4.1 — Install jabtrunner**
```bash
pnpm add -D https://github.com/holiber/jabterm/releases/download/jabtrunner-v0.1.0/jabtrunner-0.1.0.tgz
```

**Step 4.2 — Configure test scripts in `package.json`**
Following the testing-strategy contract:
```jsonc
{
  "scripts": {
    "build": "tsc",
    "test": "pnpm run build && jabtrunner all",
    "test:unit": "jabtrunner unit",
    "test:e2e": "pnpm run build && jabtrunner e2e",
    "test:scenario": "pnpm run build && jabtrunner scenario",
    "test:smoke": "pnpm run build && jabtrunner scenario --smoke",
    "test:integration": "node -e \"console.log('No integration tests yet.')\""
  }
}
```

**Step 4.3 — Create Vitest config (`vitest.config.ts`)**
- Test directory: `tests/unit/`
- Environment: node (no jsdom needed initially, since the project starts headless)

**Step 4.4 — Create Playwright config (`playwright.config.ts`)**
- Follow jabterm's project-based convention:
  - `scenario` project matching `*.scenario.e2e.ts`
  - `e2e` project matching `*.e2e.ts` (excluding scenarios)
- Test directory: `tests/`

---

### Phase 5: Create the "Hello World" Test

**Step 5.1 — Create a minimal source module**
- `src/index.ts` — exports a simple `hello()` function that returns `"Hello from UniKanban!"` (a seed for the future Unapi core)

**Step 5.2 — Create the Hello World unit test**
- `tests/unit/hello.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { hello } from '../../src/index.js';

describe('hello', () => {
  it('returns a greeting', () => {
    expect(hello()).toBe('Hello from UniKanban!');
  });
});
```

**Step 5.3 — Verify all test commands work**
- `pnpm run test:unit` — passes the hello world test
- `pnpm run test:smoke` — runs scenario tests (will pass with no tests or a placeholder)
- `pnpm run test` — runs all suites

---

### Phase 6: Update README.md

Replace the current `TODO:` with a basic project description:
- Project name and one-liner
- Link to `docs/GOALS.md`
- Quick start instructions (`pnpm install`, `pnpm test`)
- Link to `AGENTS.md` for AI agents

---

### Summary of Files Created/Modified

| File | Action |
|------|--------|
| `package.json` | Create — project config, scripts, deps |
| `pnpm-lock.yaml` | Auto-generated by pnpm install |
| `tsconfig.base.json` | Create — base TS config |
| `tsconfig.json` | Create — extends base, includes src/ |
| `.gitignore` | Create — standard ignores |
| `AGENTS.md` | Create — from jabterm + link to GOALS |
| `agents/testing-strategy.md` | Create — from jabterm (verbatim) |
| `docs/GOALS.md` | Create — project vision and Unapi description |
| `vitest.config.ts` | Create — unit test config |
| `playwright.config.ts` | Create — e2e/scenario test config |
| `src/index.ts` | Create — hello world seed module |
| `tests/unit/hello.test.ts` | Create — hello world unit test |
| `README.md` | Update — replace TODO with project info |

### Execution Order

```
Phase 1 (Scaffolding) → Phase 2 (AGENTS.md + agents/) → Phase 3 (GOALS.md) → Phase 4 (Test Runner) → Phase 5 (Hello World Test) → Phase 6 (README)
```

Each phase can be committed independently for clean git history.
