import { describe, it, expect, beforeEach } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { createMcpServer } from "../../src/transports/mcp.js";
import { PassThrough } from "node:stream";

function collectLines(stream: PassThrough): string[] {
  const lines: string[] = [];
  let buf = "";
  stream.on("data", (chunk: Buffer) => {
    buf += chunk.toString();
    const parts = buf.split("\n");
    buf = parts.pop()!;
    for (const part of parts) {
      if (part.trim()) lines.push(part);
    }
  });
  return lines;
}

describe("MCP Transport", () => {
  let output: PassThrough;
  let lines: string[];
  let server: ReturnType<typeof createMcpServer>;

  beforeEach(() => {
    resetIdCounter();
    const input = new PassThrough();
    output = new PassThrough();
    lines = collectLines(output);
    const { router } = createKanbanApi();
    server = createMcpServer(router, { input, output });
  });

  async function sendAndCollect(msg: any): Promise<any> {
    const input = new PassThrough();
    const output = new PassThrough();
    resetIdCounter();
    const { router } = createKanbanApi();
    const srv = createMcpServer(router, { input, output });
    srv.start();

    const responses: string[] = [];
    output.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) responses.push(text);
    });

    input.write(JSON.stringify(msg) + "\n");
    await new Promise((r) => setTimeout(r, 50));
    srv.stop();

    return responses.length > 0 ? JSON.parse(responses[0]) : null;
  }

  it("responds to initialize", async () => {
    const resp = await sendAndCollect({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0" } },
    });
    expect(resp.result.protocolVersion).toBe("2024-11-05");
    expect(resp.result.serverInfo.name).toBe("unikanban-mcp");
  });

  it("lists tools matching procedures", async () => {
    const resp = await sendAndCollect({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });
    expect(resp.result.tools).toBeDefined();
    const names = resp.result.tools.map((t: any) => t.name);
    expect(names).toContain("createBoard");
    expect(names).toContain("getBoard");
    expect(names).toContain("moveCard");
  });

  it("calls a tool successfully", async () => {
    const resp = await sendAndCollect({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "createBoard", arguments: { title: "MCP Board" } },
    });
    expect(resp.result.content).toBeDefined();
    const text = resp.result.content[0].text;
    const parsed = JSON.parse(text);
    expect(parsed.title).toBe("MCP Board");
  });

  it("returns error for unknown tool", async () => {
    const resp = await sendAndCollect({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "nonexistent", arguments: {} },
    });
    expect(resp.result.isError).toBe(true);
    expect(resp.result.content[0].text).toContain("Unknown tool");
  });

  it("returns error for unknown method", async () => {
    const resp = await sendAndCollect({
      jsonrpc: "2.0",
      id: 5,
      method: "unknown/method",
    });
    expect(resp.error.code).toBe(-32601);
  });

  it("tools have proper JSON Schema inputSchema", async () => {
    const resp = await sendAndCollect({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/list",
    });
    const createBoard = resp.result.tools.find((t: any) => t.name === "createBoard");
    expect(createBoard.inputSchema.type).toBe("object");
    expect(createBoard.inputSchema.properties.title.type).toBe("string");
    expect(createBoard.inputSchema.required).toContain("title");
  });
});
