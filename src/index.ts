export function hello(): string {
  return "Hello from UniKanban!";
}

export { defineProcedure, createRouter, createClient, Router, EventBus } from "./unapi/index.js";
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
  EventHandler,
} from "./unapi/index.js";

export { createKanbanApi, KanbanStore, createKanbanProcedures } from "./domain/index.js";
export type { KanbanEvents } from "./domain/index.js";
export type { Board, Column, Card } from "./domain/schemas.js";
