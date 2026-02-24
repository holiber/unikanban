import { z } from "zod";

export const CardSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const ColumnSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  cards: z.array(CardSchema),
});

export const BoardSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  columns: z.array(ColumnSchema),
});

export type Card = z.infer<typeof CardSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Board = z.infer<typeof BoardSchema>;

export const CreateCardInput = z.object({
  boardId: z.string(),
  columnId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateCardInput = z.object({
  boardId: z.string(),
  columnId: z.string(),
  cardId: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const DeleteCardInput = z.object({
  boardId: z.string(),
  columnId: z.string(),
  cardId: z.string(),
});

export const MoveCardInput = z.object({
  boardId: z.string(),
  sourceColumnId: z.string(),
  targetColumnId: z.string(),
  cardId: z.string(),
  targetIndex: z.number().int().min(0).optional(),
});

export const CreateColumnInput = z.object({
  boardId: z.string(),
  title: z.string().min(1),
});

export const UpdateColumnInput = z.object({
  boardId: z.string(),
  columnId: z.string(),
  title: z.string().min(1),
});

export const DeleteColumnInput = z.object({
  boardId: z.string(),
  columnId: z.string(),
});

export const CreateBoardInput = z.object({
  title: z.string().min(1),
});

export const GetBoardInput = z.object({
  boardId: z.string(),
});

export const DeleteBoardInput = z.object({
  boardId: z.string(),
});

export const ListBoardsInput = z.object({});

export const ImportMermaidInput = z.object({
  mermaid: z.string().min(1),
});

export const SuccessResult = z.object({
  success: z.boolean(),
});

export const BoardListResult = z.object({
  boards: z.array(BoardSchema),
});
