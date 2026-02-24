import { describe, it, expect } from "vitest";
import { z } from "zod";
import { extractFields, zodToJsonSchema } from "../../src/unapi/schema-utils.js";

describe("extractFields", () => {
  it("extracts required string fields", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const fields = extractFields(schema);
    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatchObject({ name: "name", type: "string", required: true });
    expect(fields[1]).toMatchObject({ name: "age", type: "number", required: true });
  });

  it("detects optional fields", () => {
    const schema = z.object({ title: z.string(), desc: z.string().optional() });
    const fields = extractFields(schema);
    expect(fields[0]).toMatchObject({ name: "title", required: true });
    expect(fields[1]).toMatchObject({ name: "desc", required: false });
  });

  it("extracts enum values", () => {
    const schema = z.object({ priority: z.enum(["low", "medium", "high"]) });
    const fields = extractFields(schema);
    expect(fields[0].enumValues).toEqual(["low", "medium", "high"]);
  });

  it("handles array fields", () => {
    const schema = z.object({ tags: z.array(z.string()) });
    const fields = extractFields(schema);
    expect(fields[0]).toMatchObject({ name: "tags", type: "array", itemType: "string" });
  });

  it("returns empty for non-object schemas", () => {
    const schema = z.string() as any;
    const fields = extractFields(schema);
    expect(fields).toEqual([]);
  });
});

describe("zodToJsonSchema", () => {
  it("converts string schema", () => {
    expect(zodToJsonSchema(z.string())).toEqual({ type: "string" });
  });

  it("converts number schema", () => {
    expect(zodToJsonSchema(z.number())).toEqual({ type: "number" });
  });

  it("converts boolean schema", () => {
    expect(zodToJsonSchema(z.boolean())).toEqual({ type: "boolean" });
  });

  it("converts enum schema", () => {
    const result = zodToJsonSchema(z.enum(["a", "b", "c"]));
    expect(result).toEqual({ type: "string", enum: ["a", "b", "c"] });
  });

  it("converts array schema", () => {
    const result = zodToJsonSchema(z.array(z.number()));
    expect(result).toEqual({ type: "array", items: { type: "number" } });
  });

  it("converts object schema with required and optional fields", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });
    const result = zodToJsonSchema(schema);
    expect(result).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    });
  });

  it("converts optional schema by unwrapping", () => {
    const result = zodToJsonSchema(z.string().optional());
    expect(result).toEqual({ type: "string" });
  });
});
