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

- [ ] **Design the Unapi schema definition format** — a TypeScript-first way to declare API procedures (inputs, outputs, metadata) that serves as the single source of truth
- [ ] **Implement Unapi runtime** — procedure registry, input validation (e.g. Zod), type inference (tRPC-style), self-documentation capabilities
- [ ] **Kanban domain model** — Board, Column, Card entities with CRUD operations, expressed as Unapi procedures
- [ ] **Programmatic client library** — importable API client with full TypeScript types inferred from Unapi definitions
- [ ] **Unit tests for domain** — comprehensive tests for all Kanban operations
- [ ] **Streaming / pub-sub foundation** — event emitter or observable pattern for real-time board updates
- [ ] **Video proofs** — scenario tests demonstrating Unapi core operations and domain model CRUD

---

## Tier 3 — Transports, CLI, MCP & UI

Wire up all the interface layers as thin wrappers around the Unapi core.

- [ ] **CLI wrapper (yargs)** — auto-generate commands and `--help` from Unapi definitions, thin wrapper only
- [ ] **MCP server** — thin wrapper exposing Unapi procedures as MCP tools (stdio transport)
- [ ] **HTTP transport** — REST/WebSocket server auto-generated from Unapi definitions
- [ ] **stdio / IPC transports** — additional transport implementations for headless inter-process communication
- [ ] **OpenAPI / AsyncAPI generation** — generate spec docs from Unapi definitions
- [ ] **Browser UI** — headed mode with a Kanban board web interface
- [ ] **TUI** — terminal UI for headed terminal mode
- [ ] **E2E / scenario tests** — end-to-end tests for CLI, HTTP, and UI modes
- [ ] **Video proofs** — scenario tests demonstrating CLI, MCP, HTTP, and full E2E workflows
