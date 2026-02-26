import type { Router, RouterShape } from "../unapi/index.js";
import type { UnapiCaller } from "../unapi/router.js";
import type { RouterDescription } from "../unapi/types.js";
import type {
  ProcedureFilter,
  RpcRequest,
  RpcResponse,
} from "./rpc-bridge.js";
import { createRpcBridge } from "./rpc-bridge.js";
import WebSocket, { WebSocketServer, type RawData } from "ws";

export interface WsServerOptions {
  port?: number;
  host?: string;
  path?: string;
  procedures?: ProcedureFilter;
}

export function createWsServer<T extends RouterShape>(
  router: Router<T>,
  options?: WsServerOptions,
) {
  const host = options?.host ?? "127.0.0.1";
  const port = options?.port ?? 3101;
  const path = options?.path;
  const bridge = createRpcBridge(router, { procedures: options?.procedures });

  const wss = new WebSocketServer({ host, port, path });

  function send(ws: WebSocket, resp: RpcResponse) {
    ws.send(JSON.stringify(resp));
  }

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (data: RawData) => {
      const raw = typeof data === "string" ? data : data.toString();
      let msg: RpcRequest;
      try {
        msg = JSON.parse(raw);
      } catch {
        send(ws, { id: 0, error: { message: "Invalid JSON", code: -32700 } });
        return;
      }
      const resp = await bridge.handleRequest(msg);
      send(ws, resp);
    });
  });

  return {
    wss,
    start: () =>
      new Promise<void>((resolve) => {
        try {
          if (wss.address()) {
            resolve();
            return;
          }
        } catch {
          // ignore
        }
        wss.once("listening", () => resolve());
      }),
    stop: () =>
      new Promise<void>((resolve, reject) => {
        wss.close((err?: Error) => (err ? reject(err) : resolve()));
      }),
    get address() {
      try {
        const addr = wss.address();
        if (typeof addr === "object" && addr) {
          return `ws://${host}:${addr.port}${path ?? ""}`;
        }
      } catch {
        // ignore
      }
      return `ws://${host}:${port}${path ?? ""}`;
    },
  };
}

export interface WsClientOptions {
  url: string;
  headers?: Record<string, string>;
  connectTimeoutMs?: number;
}

export type WsCaller = UnapiCaller & { close: () => void; socket: WebSocket };

export function createWsCaller(options: WsClientOptions): WsCaller {
  const ws = new WebSocket(options.url, {
    headers: options.headers,
    handshakeTimeout: options.connectTimeoutMs ?? 10_000,
  });

  let nextId = 1;
  const pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();

  const opened = new Promise<void>((resolve, reject) => {
    ws.once("open", () => resolve());
    ws.once("error", (err: Error) => reject(err));
  });

  ws.on("message", (data: RawData) => {
    const raw = typeof data === "string" ? data : data.toString();
    let resp: RpcResponse;
    try {
      resp = JSON.parse(raw);
    } catch {
      return;
    }

    const idNum = typeof resp.id === "number" ? resp.id : Number(resp.id);
    if (!Number.isFinite(idNum)) return;
    const entry = pending.get(idNum);
    if (!entry) return;
    pending.delete(idNum);

    if (resp.error) {
      entry.reject(new Error(resp.error.message));
      return;
    }
    entry.resolve(resp.result);
  });

  ws.on("close", () => {
    for (const [, entry] of pending) {
      entry.reject(new Error("WebSocket closed"));
    }
    pending.clear();
  });

  const caller: any = async (procedureName: string, input: unknown) => {
    await opened;
    const id = nextId++;
    const msg: RpcRequest = {
      id,
      method: procedureName,
      params: (input ?? {}) as any,
    };
    const result = new Promise<unknown>((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
    ws.send(JSON.stringify(msg));
    return result;
  };

  caller.close = () => ws.close();
  caller.socket = ws;
  return caller as WsCaller;
}

export async function fetchWsDescription(options: WsClientOptions) {
  const call = createWsCaller(options);
  return (await call("describe", {})) as RouterDescription;
}

export function exposeViaWs<T extends RouterShape>(
  router: Router<T>,
  options?: WsServerOptions,
) {
  return createWsServer(router, options);
}

