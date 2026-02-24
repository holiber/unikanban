Implementation plan for the UniKanban project, split into 3 tiers. Ref: #1

---

## Tier 1 — Repo Init & Scaffolding

Set up the project foundation so that agents and developers can start building immediately.

- [x] **Project scaffolding** — `package.json` (`"type": "module"`, pnpm), `tsconfig.base.json` / `tsconfig.json` (ES2022, ESNext, strict), `.gitignore`
- [x] **Install dev dependencies** — typescript, vitest, @playwright/test, yargs, jabtrunner
- [x] **AGENTS.md** — copy from jabterm, add link to `docs/GOALS.md`
- [x] **agents/testing-strategy.md** — copy testing contract from jabterm (verbatim)
- [x] **docs/GOALS.md** — document Unapi pattern, core principles, modes of operation, architecture vision
- [x] **Test runner & scripts** — configure `test`, `test:unit`, `test:e2e`, `test:scenario`, `test:smoke`, `test:integration` scripts; create `vitest.config.ts` and `playwright.config.ts`
- [x] **Hello World test** — `src/index.ts` with seed function, `tests/unit/hello.test.ts`, verify `pnpm test:unit` passes
- [x] **README.md** — replace placeholder with project info, quick start, links to GOALS and AGENTS
- [x] **Video proofs** — scenario tests with video recording for all working Tier 1 features (see #4)

---

## Tier 2 — Unapi Core & Kanban Domain

Build the core "Unapi" definition layer and the Kanban board business logic.

- [x] **Design the Unapi schema definition format** — `defineProcedure()` with Zod schemas for inputs/outputs, metadata for docs; single source of truth for types, validation, and documentation
- [x] **Implement Unapi runtime** — `Router` class with procedure registry, Zod input/output validation, tRPC-style type inference (`InferInput`/`InferOutput`), `router.describe()` self-documentation
- [x] **Kanban domain model** — Board, Column, Card entities with full CRUD operations (11 procedures), backed by `KanbanStore` with event emission
- [x] **Programmatic client library** — `createClient(router)` returns a type-safe proxy with full TypeScript inference from Unapi definitions
- [x] **Unit tests for domain** — 46 unit tests covering Unapi core, EventBus, KanbanStore CRUD, client API, and self-documentation
- [x] **Streaming / pub-sub foundation** — typed `EventBus<T>` with on/once/off/emit, integrated into KanbanStore for real-time board events
- [x] **Video proofs** — 6 scenario tests demonstrating API log, procedure registry, card CRUD, move card, full workflow

---

## Tier 3 — Transports, CLI, MCP & UI

Wire up all the interface layers as thin wrappers around the Unapi core.

- [x] **CLI wrapper (yargs)** — auto-generate commands and `--help` from Unapi definitions, thin wrapper only
- [x] **MCP server** — thin wrapper exposing Unapi procedures as MCP tools (stdio transport)
- [x] **HTTP transport** — REST server auto-generated from Unapi definitions with CORS support
- [x] **stdio / IPC transports** — JSON-RPC stdio transport for headless inter-process communication
- [x] **OpenAPI / AsyncAPI generation** — generate spec docs from Unapi definitions
- [x] **Browser UI** — headed mode with a Kanban board web interface (React + Tailwind CSS)
- [x] **TUI** — terminal UI for headed terminal mode (Ink)
- [x] **E2E / scenario tests** — unit tests for CLI, HTTP, MCP, stdio, OpenAPI; scenario tests for UI workflows
- [x] **Video proofs** — scenario tests demonstrating Browser UI CRUD, theme toggle, API log integration
