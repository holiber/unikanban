export function hello(): string {
  return "Hello from UniKanban!";
}

export {
  defineProcedure,
  createRouter,
  createClient,
  createCallerClient,
  Router,
  EventBus,
} from "./unapi/index.js";
export type {
  ProcedureMeta,
  ProcedureDefinition,
  AnyProcedure,
  RouterShape,
  RouterDescription,
  ProcedureInfo,
  InferInput,
  InferOutput,
  ClientShape,
  FlatClientShape,
  NestedClientShape,
  UnapiClient,
  EventHandler,
} from "./unapi/index.js";
export type { UnapiCaller } from "./unapi/index.js";

export { createKanbanApi, KanbanStore, createKanbanProcedures } from "./domain/index.js";
export type { KanbanEvents } from "./domain/index.js";
export type { Board, Column, Card } from "./domain/schemas.js";

export { createHttpServer } from "./transports/http.js";
export { createHttpCaller, fetchHttpDescription } from "./transports/http-client.js";
export { createStdioTransport } from "./transports/stdio.js";
export { createMcpServer } from "./transports/mcp.js";
export { generateOpenApiSpec, generateAsyncApiSpec } from "./transports/openapi.js";
export { createCli } from "./cli/index.js";
export { extractFields, zodToJsonSchema } from "./unapi/schema-utils.js";
