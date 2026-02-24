import type { Router, RouterShape } from "../unapi/index.js";
import { zodToJsonSchema } from "../unapi/schema-utils.js";

export interface OpenApiOptions {
  title?: string;
  version?: string;
  description?: string;
  serverUrl?: string;
  basePath?: string;
}

export function generateOpenApiSpec<T extends RouterShape>(
  router: Router<T>,
  options?: OpenApiOptions,
): Record<string, any> {
  const title = options?.title ?? "Unapi Service";
  const version = options?.version ?? "0.1.0";
  const description = options?.description ?? "Auto-generated from Unapi definitions";
  const serverUrl = options?.serverUrl ?? "http://localhost:3100";
  const basePath = options?.basePath ?? "/api";

  const desc = router.describe();
  const paths: Record<string, any> = {};
  const schemas: Record<string, any> = {};

  for (const proc of desc.procedures) {
    const procedure = router.procedures[proc.id as keyof T];
    const inputSchema = zodToJsonSchema(procedure.input);
    const outputSchema = zodToJsonSchema(procedure.output);

    const inputSchemaName = `${schemaNameFromId(proc.id)}Input`;
    const outputSchemaName = `${schemaNameFromId(proc.id)}Output`;
    schemas[inputSchemaName] = inputSchema;
    schemas[outputSchemaName] = outputSchema;

    const path = `${basePath}/call/${proc.id}`;
    paths[path] = {
      post: {
        operationId: proc.id,
        summary: proc.meta.description,
        tags: proc.meta.tags ?? [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${inputSchemaName}` },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: { $ref: `#/components/schemas/${outputSchemaName}` },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
        },
      },
    };
  }

  return {
    openapi: "3.0.3",
    info: { title, version, description },
    servers: [{ url: serverUrl }],
    paths,
    components: { schemas },
  };
}

export interface AsyncApiOptions {
  title?: string;
  version?: string;
  description?: string;
}

export function generateAsyncApiSpec<T extends RouterShape>(
  router: Router<T>,
  options?: AsyncApiOptions,
): Record<string, any> {
  const title = options?.title ?? "Unapi Service Events";
  const version = options?.version ?? "0.1.0";
  const description = options?.description ?? "Auto-generated from Unapi definitions";

  const desc = router.describe();
  const channels: Record<string, any> = {};

  for (const proc of desc.procedures) {
    const procedure = router.procedures[proc.id as keyof T];
    const inputSchema = zodToJsonSchema(procedure.input);
    const outputSchema = zodToJsonSchema(procedure.output);

    channels[proc.id] = {
      description: proc.meta.description,
      subscribe: {
        summary: `Response from ${proc.id}`,
        message: {
          payload: outputSchema,
        },
      },
      publish: {
        summary: `Request to ${proc.id}`,
        message: {
          payload: inputSchema,
        },
      },
    };
  }

  return {
    asyncapi: "2.6.0",
    info: { title, version, description },
    channels,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function schemaNameFromId(id: string): string {
  // OpenAPI component keys must be safe strings; keep it deterministic.
  const safe = id
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return safe
    .split("_")
    .filter(Boolean)
    .map(capitalize)
    .join("");
}
