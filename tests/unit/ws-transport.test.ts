import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { createWsServer, createWsCaller } from "../../src/transports/ws.js";

describe("WS Transport", () => {
  const { router } = createKanbanApi();
  const wsServer = createWsServer(router, { host: "127.0.0.1", port: 0 });
  let url: string;

  beforeAll(async () => {
    await wsServer.start();
    const addr = wsServer.wss.address();
    if (typeof addr === "object" && addr) {
      url = `ws://127.0.0.1:${addr.port}`;
    }
    resetIdCounter();
  });

  afterAll(async () => {
    await wsServer.stop();
  });

  it("describe returns procedure list", async () => {
    const call = createWsCaller({ url });
    const desc = (await call("describe", {})) as any;
    expect(desc.procedures).toBeDefined();
    const ids = desc.procedures.map((p: any) => p.id);
    expect(ids).toContain("board.create");
    expect(ids).toContain("card.move");
    call.close();
  });

  it("calls a procedure", async () => {
    const call = createWsCaller({ url });
    const result = (await call("board.create", { title: "WS Board" })) as any;
    expect(result.title).toBe("WS Board");
    expect(result.id).toBeDefined();
    call.close();
  });
});

describe("WS Transport filtering", () => {
  const { router } = createKanbanApi();
  const wsServer = createWsServer(router, {
    host: "127.0.0.1",
    port: 0,
    procedures: { allow: ["board"] },
  });
  let url: string;

  beforeAll(async () => {
    await wsServer.start();
    const addr = wsServer.wss.address();
    if (typeof addr === "object" && addr) {
      url = `ws://127.0.0.1:${addr.port}`;
    }
    resetIdCounter();
  });

  afterAll(async () => {
    await wsServer.stop();
  });

  it("list only includes allowed namespaces", async () => {
    const call = createWsCaller({ url });
    const listed = (await call("list", {})) as any;
    expect(listed.procedures).toContain("board.create");
    expect(listed.procedures).not.toContain("card.create");
    call.close();
  });

  it("denies calling a non-exposed procedure", async () => {
    const call = createWsCaller({ url });
    await expect(call("card.create", {})).rejects.toThrow(/not exposed|unknown/i);
    call.close();
  });
});

