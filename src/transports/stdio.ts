import type { Router, RouterShape } from "../unapi/index.js";
import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

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
}

export function createStdioTransport<T extends RouterShape>(
  router: Router<T>,
  options?: StdioTransportOptions,
) {
  const input = options?.input ?? process.stdin;
  const output = options?.output ?? process.stdout;

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

    if (msg.method === "describe") {
      send({ id: msg.id, result: router.describe() });
      return;
    }

    if (msg.method === "list") {
      send({ id: msg.id, result: { procedures: router.procedureNames } });
      return;
    }

    if (!router.procedureNames.includes(msg.method as any)) {
      send({
        id: msg.id,
        error: { message: `Unknown procedure: ${msg.method}`, code: -32601 },
      });
      return;
    }

    try {
      const result = await router.call(msg.method as any, (msg.params ?? {}) as any);
      send({ id: msg.id, result });
    } catch (err: any) {
      send({ id: msg.id, error: { message: err.message, code: -32000 } });
    }
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
