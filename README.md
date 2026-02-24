# UniKanban

A Kanban board built with the **Unapi** pattern — self-documented, type-safe, transport-agnostic APIs in TypeScript.

## Quick Start

```bash
pnpm install
```

### Web (Browser)

Start the Vite dev server and open in your browser:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build:app
```

### TUI (Terminal)

Launch the terminal UI powered by Ink:

```bash
pnpm dev:tui
```

Keyboard controls: `h`/`j`/`k`/`l` or arrow keys to navigate, `t` to toggle theme, `q` to quit.

Build the TUI:

```bash
pnpm build:tui
```

### Headless (Library)

Import the core library and use the Unapi-powered Kanban API:

```ts
import { createKanbanApi } from "unikanban";

const { client } = createKanbanApi();

// Full CRUD with type-safe, validated inputs
const board = await client.createBoard({ title: "Sprint 1" });
const col = await client.createColumn({ boardId: board.id, title: "To Do" });
const card = await client.createCard({
  boardId: board.id,
  columnId: col.id,
  title: "Write tests",
  priority: "high",
});

// Move cards between columns
await client.moveCard({
  boardId: board.id,
  sourceColumnId: col.id,
  targetColumnId: doneCol.id,
  cardId: card.id,
});
```

Build the library:

```bash
pnpm build
```

## Testing

```bash
pnpm test          # all tests (unit + e2e + scenario)
pnpm test:unit     # unit tests only
pnpm test:smoke    # fast smoke check
```

## Documentation

- [docs/GOALS.md](docs/GOALS.md) — project vision and the Unapi pattern
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical architecture, project structure, component system
- [AGENTS.md](AGENTS.md) — testing contract and conventions for AI agents
