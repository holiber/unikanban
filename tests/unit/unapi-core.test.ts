import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  defineProcedure,
  createRouter,
  createClient,
} from "../../src/unapi/index.js";

describe("defineProcedure", () => {
  it("creates a procedure with meta, input, output, and handler", () => {
    const proc = defineProcedure({
      meta: { description: "Add two numbers", tags: ["math"] },
      input: z.object({ a: z.number(), b: z.number() }),
      output: z.object({ sum: z.number() }),
      handler: (input) => ({ sum: input.a + input.b }),
    });

    expect(proc.meta.description).toBe("Add two numbers");
    expect(proc.meta.tags).toEqual(["math"]);
    expect(proc.input).toBeDefined();
    expect(proc.output).toBeDefined();
    expect(proc.handler).toBeTypeOf("function");
  });
});

describe("Router", () => {
  const procedures = {
    add: defineProcedure({
      meta: { description: "Add two numbers" },
      input: z.object({ a: z.number(), b: z.number() }),
      output: z.object({ sum: z.number() }),
      handler: (input) => ({ sum: input.a + input.b }),
    }),
    greet: defineProcedure({
      meta: { description: "Greet a person", tags: ["string"] },
      input: z.object({ name: z.string() }),
      output: z.object({ message: z.string() }),
      handler: (input) => ({ message: `Hello, ${input.name}!` }),
    }),
  };

  it("lists procedure names", () => {
    const router = createRouter(procedures);
    expect(router.procedureNames.sort()).toEqual(["add", "greet"]);
  });

  it("calls a procedure and validates input/output", async () => {
    const router = createRouter(procedures);
    const result = await router.call("add", { a: 2, b: 3 });
    expect(result).toEqual({ sum: 5 });
  });

  it("rejects invalid input", async () => {
    const router = createRouter(procedures);
    await expect(
      router.call("add", { a: "not-a-number", b: 3 } as any),
    ).rejects.toThrow();
  });

  it("throws for unknown procedure", async () => {
    const router = createRouter(procedures);
    await expect(
      (router as any).call("unknown", {}),
    ).rejects.toThrow("Unknown procedure: unknown");
  });

  it("describes all procedures", () => {
    const router = createRouter(procedures);
    const desc = router.describe();
    expect(desc.procedures).toHaveLength(2);

    const addDesc = desc.procedures.find((p) => p.name === "add")!;
    expect(addDesc.description).toBe("Add two numbers");
    expect(addDesc.tags).toEqual([]);

    const greetDesc = desc.procedures.find((p) => p.name === "greet")!;
    expect(greetDesc.description).toBe("Greet a person");
    expect(greetDesc.tags).toEqual(["string"]);
  });
});

describe("createClient", () => {
  it("creates a type-safe client proxy", async () => {
    const router = createRouter({
      multiply: defineProcedure({
        meta: { description: "Multiply two numbers" },
        input: z.object({ a: z.number(), b: z.number() }),
        output: z.object({ product: z.number() }),
        handler: (input) => ({ product: input.a * input.b }),
      }),
    });
    const client = createClient(router);

    const result = await client.multiply({ a: 4, b: 5 });
    expect(result).toEqual({ product: 20 });
  });

  it("validates through the client proxy", async () => {
    const router = createRouter({
      echo: defineProcedure({
        meta: { description: "Echo input" },
        input: z.object({ text: z.string().min(1) }),
        output: z.object({ text: z.string() }),
        handler: (input) => ({ text: input.text }),
      }),
    });
    const client = createClient(router);

    await expect(client.echo({ text: "" })).rejects.toThrow();
    const result = await client.echo({ text: "hello" });
    expect(result).toEqual({ text: "hello" });
  });
});
