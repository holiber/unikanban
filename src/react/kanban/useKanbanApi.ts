import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  createKanbanApi,
  type KanbanProcedures,
} from "../../domain/index.js";
import type { Board, Card } from "../../domain/schemas.js";
import type { RouterDescription, InferInput, InferOutput } from "../../unapi/types.js";
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
  const localApiRef = useRef<ReturnType<typeof createKanbanApi> | null>(null);

  type KanbanCall = <K extends keyof KanbanProcedures & string>(
    id: K,
    input: InferInput<KanbanProcedures[K]>,
  ) => Promise<InferOutput<KanbanProcedures[K]>>;

  const [call, setCall] = useState<KanbanCall | null>(null);

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
    if (!call) return;
    if (!boardIdRef.current) return;
    const next = await call("board.get", { boardId: boardIdRef.current } as any);
    setBoard(next);
  }, [call]);

  useEffect(() => {
    let cancelled = false;

    async function ensureSeededBoard() {
      if (config.mode === "remote") {
        const caller = createHttpCaller({ apiBaseUrl: config.apiBaseUrl! });
        const remoteCall: KanbanCall = (async (id: any, input: any) =>
          caller(String(id), input)) as any;

        try {
          const desc = await fetchHttpDescription({ apiBaseUrl: config.apiBaseUrl! });
          if (!cancelled) setRouterDescription(desc);
        } catch {
          // ignore (UI still works without registry)
        }
        if (!cancelled) setCall(() => remoteCall);

        const key = `unikanban:remote:boardId:${config.apiBaseUrl}`;
        const saved = window.localStorage.getItem(key) ?? "";
        if (saved) {
          try {
            const existing = await remoteCall("board.get", { boardId: saved } as any);
            if (cancelled) return;
            boardIdRef.current = saved;
            setBoard(existing);
            return;
          } catch {
            window.localStorage.removeItem(key);
          }
        }

        const created = await remoteCall("board.importMermaid", { mermaid: DEMO_MERMAID } as any);
        if (cancelled) return;
        boardIdRef.current = created.id;
        window.localStorage.setItem(key, created.id);
        setBoard(created);
        return;
      }

      // local mode
      const localApi = localApiRef.current;
      const api = localApi ?? createKanbanApi();
      localApiRef.current = api;
      if (!cancelled) {
        setRouterDescription(api.router.describe());
        setCall(() => api.router.call.bind(api.router) as any);
      }
      const created = await api.router.call("board.importMermaid" as any, { mermaid: DEMO_MERMAID });
      if (cancelled) return;
      boardIdRef.current = created.id;
      setBoard(created);
    }

    ensureSeededBoard();
    return () => {
      cancelled = true;
    };
  }, [config.mode, config.apiBaseUrl]);

  const addCard = useCallback(async (columnId: string, title: string) => {
    if (!call) return;
    const input = { boardId: boardIdRef.current, columnId, title };
    const card = await call("card.create", input as any);
    logCall("card.create", input, card);
    await refresh();
  }, [call, logCall, refresh]);

  const deleteCard = useCallback(async (columnId: string, cardId: string) => {
    if (!call) return;
    const input = { boardId: boardIdRef.current, columnId, cardId };
    const result = await call("card.delete", input as any);
    logCall("card.delete", input, result);
    await refresh();
  }, [call, logCall, refresh]);

  const addColumn = useCallback(async (title: string) => {
    if (!call) return;
    const input = { boardId: boardIdRef.current, title };
    const col = await call("column.create", input as any);
    logCall("column.create", input, col);
    await refresh();
  }, [call, logCall, refresh]);

  const deleteColumn = useCallback(async (columnId: string) => {
    if (!call) return;
    const input = { boardId: boardIdRef.current, columnId };
    const result = await call("column.delete", input as any);
    logCall("column.delete", input, result);
    await refresh();
  }, [call, logCall, refresh]);

  const moveCard = useCallback(async (sourceColumnId: string, targetColumnId: string, cardId: string) => {
    if (!call) return;
    const input = { boardId: boardIdRef.current, sourceColumnId, targetColumnId, cardId };
    const card = await call("card.move", input as any);
    logCall("card.move", input, card);
    await refresh();
  }, [call, logCall, refresh]);

  const updateCard = useCallback(async (columnId: string, cardId: string, updates: { title?: string; description?: string; priority?: Card["priority"] }) => {
    if (!call) return;
    const input = { boardId: boardIdRef.current, columnId, cardId, ...updates };
    const card = await call("card.update", input as any);
    logCall("card.update", input, card);
    await refresh();
  }, [call, logCall, refresh]);

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
