# Agents

If you are an AI agent (or automation) working on this repository, follow the test contract described in:

- [`agents/testing-strategy.md`](agents/testing-strategy.md)

## Project Goals

See [`docs/GOALS.md`](docs/GOALS.md) for the vision
See [`docs/unapi.md`](docs/GOALS.md) for the vision

## Cursor Cloud specific instructions

### Overview

UniKanban is a single-package TypeScript project (not a monorepo). All state is in-memory — no databases, Docker, or external services required.

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Web UI (Vite dev) | `pnpm dev` | 5173 | Main headed experience; demo board at `/demo/` |
| HTTP REST server | `pnpm http` | 3100 (or `PORT` env) | Auto-generated from Unapi definitions |
| CLI | `pnpm cli` | — | Ad-hoc commands, not a long-lived process |
| TUI | `pnpm dev:tui` | — | Terminal UI using Ink; requires interactive TTY |
| MCP server | `pnpm mcp` | — | stdio transport |

### Testing

See `README.md` and `agents/testing-strategy.md` for the full test contract. Key commands:

- `pnpm test:unit` — Vitest unit tests (fast, no browser needed)
- `pnpm test:smoke` — builds then runs Playwright scenario tests with smoke rules
- `pnpm test:scenario` — full scenario tests (Playwright, requires chromium)
- `pnpm test` — all tests (unit + e2e + scenario; builds first)

Playwright chromium must be installed: `pnpm exec playwright install chromium --with-deps`

### Build

- `pnpm build` — TypeScript library compilation (`tsc`)
- `pnpm build:app` — Vite production build of web app

### Non-obvious caveats

- Node.js 22 is required (specified in CI). The project uses ESM (`"type": "module"`).
- The package manager is `pnpm@10.12.1` (specified in `packageManager` field).
- `pnpm build` (tsc) must succeed before `pnpm test:smoke` or `pnpm test:scenario` — those scripts run build as a prerequisite.
- There is no separate lint command (no ESLint configured); type checking is done via `pnpm build` (tsc).
- The `jabtrunner` test orchestrator is installed from a GitHub release tarball, not npm. `pnpm install` handles this automatically.
