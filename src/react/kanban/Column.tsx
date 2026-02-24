import { useState } from "react";
import { Badge, Button, Input } from "../inc/index.js";
import { CardItem } from "./CardItem.js";
import type { KanbanCard, KanbanColumn } from "./types.js";

interface ColumnProps {
  column: KanbanColumn;
  allColumns: KanbanColumn[];
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onMoveCard?: (sourceColumnId: string, targetColumnId: string, cardId: string) => void;
}

export function Column({ column, allColumns, onAddCard, onDeleteCard, onMoveCard }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function handleSubmit() {
    const title = newTitle.trim();
    if (!title) return;
    onAddCard(column.id, title);
    setNewTitle("");
    setIsAdding(false);
  }

  function handleCancel() {
    setIsAdding(false);
    setNewTitle("");
  }

  const otherColumns = allColumns.filter((c) => c.id !== column.id);

  return (
    <div
      data-testid="kanban-column"
      className="flex w-72 shrink-0 flex-col rounded-xl border border-border-primary
        bg-surface-secondary"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            {column.title}
          </h3>
          <Badge>{column.cards.length}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
        {column.cards.map((card: KanbanCard) => (
          <CardItem
            key={card.id}
            card={card}
            onDelete={(cardId: string) => onDeleteCard(column.id, cardId)}
            onMove={onMoveCard ? (cardId: string, targetColumnId: string) =>
              onMoveCard(column.id, targetColumnId, cardId) : undefined}
            otherColumns={otherColumns}
          />
        ))}

        {isAdding ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Card title..."
              value={newTitle}
              onChange={setNewTitle}
              onSubmit={handleSubmit}
              onEscape={handleCancel}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} size="sm">
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2
              text-sm text-text-tertiary transition-colors
              hover:bg-surface-hover hover:text-text-secondary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add card
          </button>
        )}
      </div>
    </div>
  );
}
