import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { createHttpServer } from "../../src/transports/http.js";

describe("HTTP Transport", () => {
  const { router } = createKanbanApi();
  const httpServer = createHttpServer(router, { port: 0 });
  let baseUrl: string;

  beforeAll(async () => {
    await httpServer.start();
    const addr = httpServer.server.address();
    if (typeof addr === "object" && addr) {
      baseUrl = `http://127.0.0.1:${addr.port}`;
    }
    resetIdCounter();
  });

  afterAll(async () => {
    await httpServer.stop();
  });

  it("GET /api/describe returns procedure list", async () => {
    const res = await fetch(`${baseUrl}/api/describe`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.procedures).toBeDefined();
    expect(data.procedures.length).toBeGreaterThan(0);
    const names = data.procedures.map((p: any) => p.name);
    expect(names).toContain("createBoard");
    expect(names).toContain("getBoard");
  });

  it("POST /api/call/createBoard creates a board", async () => {
    const res = await fetch(`${baseUrl}/api/call/createBoard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "HTTP Test Board" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.title).toBe("HTTP Test Board");
    expect(data.result.id).toBeDefined();
  });

  it("returns 404 for unknown procedure", async () => {
    const res = await fetch(`${baseUrl}/api/call/unknownProc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("Unknown procedure");
  });

  it("returns 400 for invalid JSON body", async () => {
    const res = await fetch(`${baseUrl}/api/call/createBoard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid JSON");
  });

  it("handles CORS preflight", async () => {
    const res = await fetch(`${baseUrl}/api/call/createBoard`, {
      method: "OPTIONS",
    });
    expect(res.status).toBe(204);
  });

  it("returns 404 for unknown paths", async () => {
    const res = await fetch(`${baseUrl}/unknown`);
    expect(res.status).toBe(404);
  });
});
