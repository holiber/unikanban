import { describe, it, expect } from "vitest";
import { createKanbanApi } from "../../src/domain/index.js";
import { generateOpenApiSpec, generateAsyncApiSpec } from "../../src/transports/openapi.js";

describe("OpenAPI Generation", () => {
  const { router } = createKanbanApi();

  it("generates valid OpenAPI 3.0 structure", () => {
    const spec = generateOpenApiSpec(router, {
      title: "UniKanban API",
      version: "0.1.0",
    });
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info.title).toBe("UniKanban API");
    expect(spec.info.version).toBe("0.1.0");
    expect(spec.servers).toBeDefined();
    expect(spec.paths).toBeDefined();
    expect(spec.components.schemas).toBeDefined();
  });

  it("generates paths for all procedures", () => {
    const spec = generateOpenApiSpec(router);
    const paths = Object.keys(spec.paths);
    expect(paths).toContain("/api/call/board.create");
    expect(paths).toContain("/api/call/board.get");
    expect(paths).toContain("/api/call/board.importMermaid");
    expect(paths).toContain("/api/call/card.move");
    expect(paths.length).toBe(12);
  });

  it("includes request/response schemas for each endpoint", () => {
    const spec = generateOpenApiSpec(router);
    const createBoard = spec.paths["/api/call/board.create"].post;
    expect(createBoard.operationId).toBe("board.create");
    expect(createBoard.summary).toBe("Create a new kanban board");
    expect(createBoard.requestBody.content["application/json"].schema.$ref).toContain(
      "BoardCreateInput",
    );
    expect(createBoard.responses["200"]).toBeDefined();
    expect(createBoard.responses["400"]).toBeDefined();
  });

  it("generates component schemas with correct types", () => {
    const spec = generateOpenApiSpec(router);
    const schemas = spec.components.schemas;
    expect(schemas.BoardCreateInput).toEqual({
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    });
  });
});

describe("AsyncAPI Generation", () => {
  const { router } = createKanbanApi();

  it("generates valid AsyncAPI 2.6 structure", () => {
    const spec = generateAsyncApiSpec(router, {
      title: "UniKanban Events",
      version: "0.1.0",
    });
    expect(spec.asyncapi).toBe("2.6.0");
    expect(spec.info.title).toBe("UniKanban Events");
    expect(spec.channels).toBeDefined();
  });

  it("generates channels for all procedures", () => {
    const spec = generateAsyncApiSpec(router);
    const channels = Object.keys(spec.channels);
    expect(channels).toContain("board.create");
    expect(channels).toContain("board.importMermaid");
    expect(channels).toContain("card.move");
    expect(channels.length).toBe(12);
  });

  it("includes publish/subscribe messages", () => {
    const spec = generateAsyncApiSpec(router);
    const createBoard = spec.channels["board.create"];
    expect(createBoard.publish.message.payload).toBeDefined();
    expect(createBoard.subscribe.message.payload).toBeDefined();
  });
});
