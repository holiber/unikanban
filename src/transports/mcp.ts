import type { Router, RouterShape } from "../unapi/index.js";
import { extractFields, zodToJsonSchema } from "../unapi/schema-utils.js";
import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface McpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface McpServerOptions {
  name?: string;
  version?: string;
  input?: Readable;
  output?: Writable;
}

export function createMcpServer<T extends RouterShape>(
  router: Router<T>,
  options?: McpServerOptions,
) {
  const input = options?.input ?? process.stdin;
  const output = options?.output ?? process.stdout;
  const serverName = options?.name ?? "unikanban-mcp";
  const serverVersion = options?.version ?? "0.1.0";

  function send(response: McpResponse) {
    output.write(JSON.stringify(response) + "\n");
  }

  function buildToolList() {
    const desc = router.describe();
    return desc.procedures.map((proc) => {
      const procedure = router.procedures[proc.id as keyof T];
      const inputJsonSchema = zodToJsonSchema(procedure.input);
      return {
        name: proc.id,
        description: proc.meta.description,
        inputSchema: inputJsonSchema,
      };
    });
  }

  async function handleRequest(req: McpRequest) {
    switch (req.method) {
      case "initialize":
        send({
          jsonrpc: "2.0",
          id: req.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: serverName, version: serverVersion },
          },
        });
        break;

      case "notifications/initialized":
        break;

      case "tools/list":
        send({
          jsonrpc: "2.0",
          id: req.id,
          result: { tools: buildToolList() },
        });
        break;

      case "tools/call": {
        const toolName = (req.params as any)?.name;
        const toolArgs = (req.params as any)?.arguments ?? {};

        if (!router.procedureNames.includes(toolName as any)) {
          send({
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
              isError: true,
            },
          });
          break;
        }

        try {
          const result = await router.call(toolName as any, toolArgs as any);
          send({
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            },
          });
        } catch (err: any) {
          send({
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [{ type: "text", text: `Error: ${err.message}` }],
              isError: true,
            },
          });
        }
        break;
      }

      default:
        send({
          jsonrpc: "2.0",
          id: req.id,
          error: { code: -32601, message: `Method not found: ${req.method}` },
        });
    }
  }

  const rl = createInterface({ input, terminal: false });

  function start() {
    rl.on("line", (line) => {
      if (!line.trim()) return;
      try {
        const req = JSON.parse(line) as McpRequest;
        handleRequest(req);
      } catch {
        send({
          jsonrpc: "2.0",
          id: 0,
          error: { code: -32700, message: "Parse error" },
        });
      }
    });
  }

  function stop() {
    rl.close();
  }

  return { start, stop, handleRequest, buildToolList };
}
