import { describe, it, expect, beforeEach } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { createStdioTransport } from "../../src/transports/stdio.js";
import { PassThrough } from "node:stream";

describe("Stdio Transport", () => {
  async function sendAndCollect(msg: any): Promise<any> {
    const input = new PassThrough();
    const output = new PassThrough();
    resetIdCounter();
    const { router } = createKanbanApi();
    const transport = createStdioTransport(router, { input, output });
    transport.start();

    const responses: string[] = [];
    output.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) responses.push(text);
    });

    input.write(JSON.stringify(msg) + "\n");
    await new Promise((r) => setTimeout(r, 50));
    transport.stop();

    return responses.length > 0 ? JSON.parse(responses[0]) : null;
  }

  it("handles describe method", async () => {
    const resp = await sendAndCollect({ id: 1, method: "describe" });
    expect(resp.result.procedures).toBeDefined();
    expect(resp.result.procedures.length).toBeGreaterThan(0);
  });

  it("handles list method", async () => {
    const resp = await sendAndCollect({ id: 1, method: "list" });
    expect(resp.result.procedures).toContain("createBoard");
    expect(resp.result.procedures).toContain("moveCard");
  });

  it("calls a procedure", async () => {
    const resp = await sendAndCollect({
      id: 1,
      method: "createBoard",
      params: { title: "Stdio Board" },
    });
    expect(resp.result.title).toBe("Stdio Board");
    expect(resp.result.id).toBe("id-1");
  });

  it("returns error for unknown procedure", async () => {
    const resp = await sendAndCollect({ id: 1, method: "unknown" });
    expect(resp.error.code).toBe(-32601);
    expect(resp.error.message).toContain("Unknown procedure");
  });

  it("returns error for invalid JSON", async () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const { router } = createKanbanApi();
    const transport = createStdioTransport(router, { input, output });
    transport.start();

    const responses: string[] = [];
    output.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) responses.push(text);
    });

    input.write("not-valid-json\n");
    await new Promise((r) => setTimeout(r, 50));
    transport.stop();

    const resp = JSON.parse(responses[0]);
    expect(resp.error.code).toBe(-32700);
  });
});
