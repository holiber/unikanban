import { useState, useCallback, useRef, useMemo } from "react";
import { createKanbanApi } from "../../domain/index.js";
import type { Board, Card, Column } from "../../domain/schemas.js";
import type { KanbanEvents } from "../../domain/store.js";

export interface ApiLogEntry {
  id: number;
  procedure: string;
  input: Record<string, unknown>;
  result: unknown;
  ts: number;
}

const DEMO_SEED: { title: string; columns: { title: string; cards: { title: string; description?: string; priority?: Card["priority"]; tags?: string[] }[] }[] } = {
  title: "UniKanban Board",
  columns: [
    {
      title: "Backlog",
      cards: [
        { title: "Design Unapi schema format", description: "Define the TypeScript-first API procedure declaration format", priority: "high", tags: ["core"] },
        { title: "Research transport options", description: "Compare HTTP, stdio, IPC for transport layer", priority: "medium", tags: ["research"] },
      ],
    },
    {
      title: "To Do",
      cards: [
        { title: "Implement CLI wrapper", description: "yargs-based CLI that auto-generates --help from Unapi definitions", priority: "medium", tags: ["cli"] },
      ],
    },
    {
      title: "In Progress",
      cards: [
        { title: "Project scaffolding", description: "Set up TypeScript, Vite, React, Tailwind, test runner", priority: "high", tags: ["setup"] },
      ],
    },
    {
      title: "Done",
      cards: [
        { title: "Create GOALS.md", priority: "low", tags: ["docs"] },
      ],
    },
  ],
};

function seedStore(api: ReturnType<typeof createKanbanApi>, seed: typeof DEMO_SEED): string {
  const board = api.store.createBoard(seed.title);
  for (const col of seed.columns) {
    const column = api.store.createColumn(board.id, col.title);
    for (const card of col.cards) {
      api.store.createCard(board.id, column.id, card);
    }
  }
  return board.id;
}

export function useKanbanApi() {
  const apiRef = useRef<ReturnType<typeof createKanbanApi> | null>(null);
  const boardIdRef = useRef<string>("");

  if (!apiRef.current) {
    const api = createKanbanApi();
    apiRef.current = api;
    boardIdRef.current = seedStore(api, DEMO_SEED);
  }

  const api = apiRef.current;

  const [board, setBoard] = useState<Board>(() =>
    api.store.getBoard(boardIdRef.current),
  );
  const [log, setLog] = useState<ApiLogEntry[]>([]);
  const nextLogId = useRef(1);

  const logCall = useCallback((procedure: string, input: Record<string, unknown>, result: unknown) => {
    setLog((prev) => [
      { id: nextLogId.current++, procedure, input, result, ts: Date.now() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const refresh = useCallback(() => {
    setBoard(api.store.getBoard(boardIdRef.current));
  }, [api]);

  const addCard = useCallback(async (columnId: string, title: string) => {
    const input = { boardId: boardIdRef.current, columnId, title };
    const card = await api.client.card.create(input);
    logCall("card.create", input, card);
    refresh();
  }, [api, logCall, refresh]);

  const deleteCard = useCallback(async (columnId: string, cardId: string) => {
    const input = { boardId: boardIdRef.current, columnId, cardId };
    const result = await api.client.card.delete(input);
    logCall("card.delete", input, result);
    refresh();
  }, [api, logCall, refresh]);

  const addColumn = useCallback(async (title: string) => {
    const input = { boardId: boardIdRef.current, title };
    const col = await api.client.column.create(input);
    logCall("column.create", input, col);
    refresh();
  }, [api, logCall, refresh]);

  const deleteColumn = useCallback(async (columnId: string) => {
    const input = { boardId: boardIdRef.current, columnId };
    const result = await api.client.column.delete(input);
    logCall("column.delete", input, result);
    refresh();
  }, [api, logCall, refresh]);

  const moveCard = useCallback(async (sourceColumnId: string, targetColumnId: string, cardId: string) => {
    const input = { boardId: boardIdRef.current, sourceColumnId, targetColumnId, cardId };
    const card = await api.client.card.move(input);
    logCall("card.move", input, card);
    refresh();
  }, [api, logCall, refresh]);

  const updateCard = useCallback(async (columnId: string, cardId: string, updates: { title?: string; description?: string; priority?: Card["priority"] }) => {
    const input = { boardId: boardIdRef.current, columnId, cardId, ...updates };
    const card = await api.client.card.update(input);
    logCall("card.update", input, card);
    refresh();
  }, [api, logCall, refresh]);

  const routerDescription = useMemo(() => api.router.describe(), [api]);

  return {
    board,
    log,
    addCard,
    deleteCard,
    addColumn,
    deleteColumn,
    moveCard,
    updateCard,
    routerDescription,
  };
}
