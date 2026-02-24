import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  createKanbanApi,
  KANBAN_PROCEDURE_IDS,
  type KanbanProcedures,
} from "../../domain/index.js";
import type { Board, Card } from "../../domain/schemas.js";
import type { RouterDescription, UnapiClient } from "../../unapi/types.js";
import { createCallerClient } from "../../unapi/index.js";
import { createHttpCaller, fetchHttpDescription } from "../../transports/http-client.js";

export interface ApiLogEntry {
  id: number;
  procedure: string;
  input: Record<string, unknown>;
  result: unknown;
  ts: number;
}

const DEMO_MERMAID = `
---
title: UniKanban Board
---
kanban
  Backlog
    [Design Unapi schema format - Define the TypeScript-first API procedure declaration format] !high #core
    [Research transport options - Compare HTTP, stdio, IPC for transport layer] !medium #research
  To Do
    [Implement CLI wrapper - yargs-based CLI that auto-generates --help from Unapi definitions] !medium #cli
  In Progress
    [Project scaffolding - Set up TypeScript, Vite, React, Tailwind, test runner] !high #setup
  Done
    [Create GOALS.md] !low #docs
`.trim();

type Mode = "local" | "remote";

function getModeFromLocation(): { mode: Mode; apiBaseUrl?: string } {
  if (typeof window === "undefined") return { mode: "local" };
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const apiBaseUrl = params.get("apiBaseUrl") ?? params.get("apiBase") ?? undefined;
  if (mode === "remote") {
    return { mode: "remote", apiBaseUrl: apiBaseUrl ?? "http://127.0.0.1:3100/api" };
  }
  return { mode: "local" };
}

export function useKanbanApi() {
  const config = useMemo(() => getModeFromLocation(), []);
  const boardIdRef = useRef<string>("");
  const clientRef = useRef<UnapiClient<KanbanProcedures> | null>(null);
  const localApiRef = useRef<ReturnType<typeof createKanbanApi> | null>(null);

  if (!clientRef.current) {
    if (config.mode === "local") {
      const api = createKanbanApi();
      localApiRef.current = api;
      clientRef.current = api.client as any;
    } else {
      const caller = createHttpCaller({ apiBaseUrl: config.apiBaseUrl! });
      clientRef.current = createCallerClient<KanbanProcedures>(
        KANBAN_PROCEDURE_IDS,
        caller,
      );
    }
  }

  const client = clientRef.current!;

  const [board, setBoard] = useState<Board>({
    id: "",
    title: "Loading…",
    columns: [],
  });
  const [log, setLog] = useState<ApiLogEntry[]>([]);
  const [routerDescription, setRouterDescription] = useState<RouterDescription>({ procedures: [] });
  const nextLogId = useRef(1);

  const logCall = useCallback((procedure: string, input: Record<string, unknown>, result: unknown) => {
    setLog((prev) => [
      { id: nextLogId.current++, procedure, input, result, ts: Date.now() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const refresh = useCallback(async () => {
    if (!boardIdRef.current) return;
    const next = await client.board.get({ boardId: boardIdRef.current });
    setBoard(next);
  }, [client]);

  useEffect(() => {
    let cancelled = false;

    async function ensureSeededBoard() {
      if (config.mode === "remote") {
        try {
          const desc = await fetchHttpDescription({ apiBaseUrl: config.apiBaseUrl! });
          if (!cancelled) setRouterDescription(desc);
        } catch {
          // ignore (UI still works without registry)
        }

        const key = `unikanban:remote:boardId:${config.apiBaseUrl}`;
        const saved = window.localStorage.getItem(key) ?? "";
        if (saved) {
          try {
            const existing = await client.board.get({ boardId: saved });
            if (cancelled) return;
            boardIdRef.current = saved;
            setBoard(existing);
            return;
          } catch {
            window.localStorage.removeItem(key);
          }
        }

        const created = await client.board.importMermaid({ mermaid: DEMO_MERMAID });
        if (cancelled) return;
        boardIdRef.current = created.id;
        window.localStorage.setItem(key, created.id);
        setBoard(created);
        return;
      }

      // local mode
      const localApi = localApiRef.current;
      if (localApi) {
        setRouterDescription(localApi.router.describe());
      }
      const created = await client.board.importMermaid({ mermaid: DEMO_MERMAID });
      if (cancelled) return;
      boardIdRef.current = created.id;
      setBoard(created);
    }

    ensureSeededBoard();
    return () => {
      cancelled = true;
    };
  }, [client, config.mode, config.apiBaseUrl]);

  const addCard = useCallback(async (columnId: string, title: string) => {
    const input = { boardId: boardIdRef.current, columnId, title };
    const card = await client.card.create(input);
    logCall("card.create", input, card);
    await refresh();
  }, [client, logCall, refresh]);

  const deleteCard = useCallback(async (columnId: string, cardId: string) => {
    const input = { boardId: boardIdRef.current, columnId, cardId };
    const result = await client.card.delete(input);
    logCall("card.delete", input, result);
    await refresh();
  }, [client, logCall, refresh]);

  const addColumn = useCallback(async (title: string) => {
    const input = { boardId: boardIdRef.current, title };
    const col = await client.column.create(input);
    logCall("column.create", input, col);
    await refresh();
  }, [client, logCall, refresh]);

  const deleteColumn = useCallback(async (columnId: string) => {
    const input = { boardId: boardIdRef.current, columnId };
    const result = await client.column.delete(input);
    logCall("column.delete", input, result);
    await refresh();
  }, [client, logCall, refresh]);

  const moveCard = useCallback(async (sourceColumnId: string, targetColumnId: string, cardId: string) => {
    const input = { boardId: boardIdRef.current, sourceColumnId, targetColumnId, cardId };
    const card = await client.card.move(input);
    logCall("card.move", input, card);
    await refresh();
  }, [client, logCall, refresh]);

  const updateCard = useCallback(async (columnId: string, cardId: string, updates: { title?: string; description?: string; priority?: Card["priority"] }) => {
    const input = { boardId: boardIdRef.current, columnId, cardId, ...updates };
    const card = await client.card.update(input);
    logCall("card.update", input, card);
    await refresh();
  }, [client, logCall, refresh]);

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
