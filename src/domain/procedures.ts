import { defineProcedure } from "../unapi/define.js";
import { KanbanStore } from "./store.js";
import {
  BoardSchema,
  BoardListResult,
  CardSchema,
  ColumnSchema,
  SuccessResult,
  GetBoardInput,
  ListBoardsInput,
  CreateBoardInput,
  DeleteBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
  DeleteColumnInput,
  CreateCardInput,
  UpdateCardInput,
  DeleteCardInput,
  MoveCardInput,
} from "./schemas.js";

export function createKanbanProcedures(store: KanbanStore) {
  const getBoard = defineProcedure({
    meta: { description: "Get a kanban board by ID", tags: ["board", "read"] },
    input: GetBoardInput,
    output: BoardSchema,
    handler: (input) => store.getBoard(input.boardId),
  });

  const listBoards = defineProcedure({
    meta: { description: "List all kanban boards", tags: ["board", "read"] },
    input: ListBoardsInput,
    output: BoardListResult,
    handler: () => ({ boards: store.listBoards() }),
  });

  const createBoard = defineProcedure({
    meta: { description: "Create a new kanban board", tags: ["board", "write"] },
    input: CreateBoardInput,
    output: BoardSchema,
    handler: (input) => store.createBoard(input.title),
  });

  const deleteBoard = defineProcedure({
    meta: { description: "Delete a kanban board", tags: ["board", "write"] },
    input: DeleteBoardInput,
    output: SuccessResult,
    handler: (input) => {
      store.deleteBoard(input.boardId);
      return { success: true };
    },
  });

  const createColumn = defineProcedure({
    meta: { description: "Add a column to a board", tags: ["column", "write"] },
    input: CreateColumnInput,
    output: ColumnSchema,
    handler: (input) => store.createColumn(input.boardId, input.title),
  });

  const updateColumn = defineProcedure({
    meta: { description: "Rename a column", tags: ["column", "write"] },
    input: UpdateColumnInput,
    output: ColumnSchema,
    handler: (input) => store.updateColumn(input.boardId, input.columnId, input.title),
  });

  const deleteColumn = defineProcedure({
    meta: { description: "Delete a column from a board", tags: ["column", "write"] },
    input: DeleteColumnInput,
    output: SuccessResult,
    handler: (input) => {
      store.deleteColumn(input.boardId, input.columnId);
      return { success: true };
    },
  });

  const createCard = defineProcedure({
    meta: { description: "Add a card to a column", tags: ["card", "write"] },
    input: CreateCardInput,
    output: CardSchema,
    handler: (input) =>
      store.createCard(input.boardId, input.columnId, {
        title: input.title,
        description: input.description,
        priority: input.priority,
        tags: input.tags,
      }),
  });

  const updateCard = defineProcedure({
    meta: { description: "Update a card's fields", tags: ["card", "write"] },
    input: UpdateCardInput,
    output: CardSchema,
    handler: (input) =>
      store.updateCard(input.boardId, input.columnId, input.cardId, {
        title: input.title,
        description: input.description,
        priority: input.priority,
        tags: input.tags,
      }),
  });

  const deleteCard = defineProcedure({
    meta: { description: "Delete a card from a column", tags: ["card", "write"] },
    input: DeleteCardInput,
    output: SuccessResult,
    handler: (input) => {
      store.deleteCard(input.boardId, input.columnId, input.cardId);
      return { success: true };
    },
  });

  const moveCard = defineProcedure({
    meta: { description: "Move a card between columns", tags: ["card", "write"] },
    input: MoveCardInput,
    output: CardSchema,
    handler: (input) =>
      store.moveCard(
        input.boardId,
        input.sourceColumnId,
        input.targetColumnId,
        input.cardId,
        input.targetIndex,
      ),
  });

  return {
    "board.get": getBoard,
    "board.list": listBoards,
    "board.create": createBoard,
    "board.delete": deleteBoard,
    "column.create": createColumn,
    "column.update": updateColumn,
    "column.delete": deleteColumn,
    "card.create": createCard,
    "card.update": updateCard,
    "card.delete": deleteCard,
    "card.move": moveCard,
  };
}
