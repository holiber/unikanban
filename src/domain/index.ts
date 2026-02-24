import { createRouter, createClient } from "../unapi/index.js";
import { KanbanStore } from "./store.js";
import { createKanbanProcedures } from "./procedures.js";

export { KanbanStore, resetIdCounter } from "./store.js";
export type { KanbanEvents } from "./store.js";
export { createKanbanProcedures } from "./procedures.js";
export * from "./schemas.js";

export function createKanbanApi(store?: KanbanStore) {
  const kanbanStore = store ?? new KanbanStore();
  const procedures = createKanbanProcedures(kanbanStore);
  const router = createRouter(procedures, {
    aliases: {
      // Legacy camelCase procedure names (compat)
      getBoard: "board.get",
      listBoards: "board.list",
      createBoard: "board.create",
      deleteBoard: "board.delete",
      createColumn: "column.create",
      updateColumn: "column.update",
      deleteColumn: "column.delete",
      createCard: "card.create",
      updateCard: "card.update",
      deleteCard: "card.delete",
      moveCard: "card.move",
    },
  });
  const client = createClient(router);

  return { store: kanbanStore, router, client };
}
