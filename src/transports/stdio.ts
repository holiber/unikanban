import type { Router, RouterShape } from "../unapi/index.js";
import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import type { ProcedureFilter } from "./rpc-bridge.js";
import { createRpcBridge } from "./rpc-bridge.js";

export interface StdioMessage {
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface StdioResponse {
  id: string | number;
  result?: unknown;
  error?: { message: string; code?: number };
}

export interface StdioTransportOptions {
  input?: Readable;
  output?: Writable;
  procedures?: ProcedureFilter;
}

export function createStdioTransport<T extends RouterShape>(
  router: Router<T>,
  options?: StdioTransportOptions,
) {
  const input = options?.input ?? process.stdin;
  const output = options?.output ?? process.stdout;
  const bridge = createRpcBridge(router, { procedures: options?.procedures });

  function send(response: StdioResponse) {
    output.write(JSON.stringify(response) + "\n");
  }

  async function handleMessage(raw: string) {
    let msg: StdioMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      send({ id: 0, error: { message: "Invalid JSON", code: -32700 } });
      return;
    }
    const resp = await bridge.handleRequest(msg);
    send(resp);
  }

  const rl = createInterface({ input, terminal: false });

  function start() {
    rl.on("line", (line) => {
      if (line.trim()) handleMessage(line.trim());
    });
  }

  function stop() {
    rl.close();
  }

  return { start, stop, handleMessage };
}

export function exposeViaStdio<T extends RouterShape>(
  router: Router<T>,
  options?: StdioTransportOptions,
) {
  return createStdioTransport(router, options);
}
