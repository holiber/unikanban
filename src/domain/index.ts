import { createRouter, createClient } from "../unapi/index.js";
import { KanbanStore } from "./store.js";
import { createKanbanProcedures } from "./procedures.js";

export { KanbanStore, resetIdCounter } from "./store.js";
export type { KanbanEvents } from "./store.js";
export { createKanbanProcedures } from "./procedures.js";
export * from "./schemas.js";

export type KanbanProcedures = ReturnType<typeof createKanbanProcedures>;

export function createKanbanApi(store?: KanbanStore) {
  const kanbanStore = store ?? new KanbanStore();
  const procedures = createKanbanProcedures(kanbanStore);
  const router = createRouter(procedures);
  const client = createClient(router);

  return { store: kanbanStore, router, client };
}
