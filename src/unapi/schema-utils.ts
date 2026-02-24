import type { z } from "zod";

export interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  enumValues?: string[];
  itemType?: string;
}

function getZodDef(schema: z.ZodType): any {
  return (schema as any)._zod?.def;
}

function resolveZodType(def: any): { type: string; enumValues?: string[]; itemType?: string } {
  if (!def) return { type: "string" };
  switch (def.type) {
    case "string":
      return { type: "string" };
    case "number":
      return def.isInt ? { type: "integer" } : { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "enum":
      return { type: "string", enumValues: Object.values(def.entries) };
    case "array": {
      const inner = resolveZodType(def.element?.def ?? def.element);
      return { type: "array", itemType: inner.type };
    }
    case "optional":
      return resolveZodType(def.innerType?.def ?? def.innerType);
    case "nullable":
      return resolveZodType(def.innerType?.def ?? def.innerType);
    case "object":
      return { type: "object" };
    default:
      return { type: "string" };
  }
}

function isOptionalField(schema: z.ZodType): boolean {
  const def = getZodDef(schema);
  return def?.type === "optional" || def?.type === "nullable";
}

export function extractFields(schema: z.ZodType): FieldInfo[] {
  const shape = (schema as any).shape;
  if (!shape) return [];

  return Object.entries(shape).map(([name, fieldSchema]) => {
    const typedField = fieldSchema as z.ZodType;
    const def = getZodDef(typedField);
    const resolved = resolveZodType(def);
    return {
      name,
      type: resolved.type,
      required: !isOptionalField(typedField),
      enumValues: resolved.enumValues,
      itemType: resolved.itemType,
    };
  });
}

export function zodToJsonSchema(schema: z.ZodType): Record<string, any> {
  const def = getZodDef(schema);
  if (!def) return { type: "object" };

  switch (def.type) {
    case "string":
      return { type: "string" };
    case "number":
      return def.isInt ? { type: "integer" } : { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "enum":
      return { type: "string", enum: Object.values(def.entries) };
    case "array": {
      const elemSchema = def.element as z.ZodType;
      return { type: "array", items: zodToJsonSchema(elemSchema) };
    }
    case "optional":
    case "nullable": {
      return zodToJsonSchema(def.innerType as z.ZodType);
    }
    case "object": {
      const shape = (schema as any).shape;
      const properties: Record<string, any> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(shape)) {
        const fieldSchema = val as z.ZodType;
        properties[key] = zodToJsonSchema(fieldSchema);
        if (!isOptionalField(fieldSchema)) {
          required.push(key);
        }
      }
      const result: Record<string, any> = { type: "object", properties };
      if (required.length > 0) result.required = required;
      return result;
    }
    default:
      return {};
  }
}
