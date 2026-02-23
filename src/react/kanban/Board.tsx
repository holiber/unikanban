import { useState } from "react";
import { Button, Input } from "../inc/index.js";
import { Column } from "./Column.js";
import type { KanbanBoard, KanbanColumn } from "./types.js";

let nextId = 1;
function uid(): string {
  return `id-${Date.now()}-${nextId++}`;
}

const DEMO_BOARD: KanbanBoard = {
  id: "board-1",
  title: "UniKanban Board",
  columns: [
    {
      id: "col-backlog",
      title: "Backlog",
      cards: [
        {
          id: "c1",
          title: "Design Unapi schema format",
          description: "Define the TypeScript-first API procedure declaration format",
          priority: "high",
          tags: ["core"],
        },
        {
          id: "c2",
          title: "Research transport options",
          description: "Compare HTTP, stdio, IPC for transport layer",
          priority: "medium",
          tags: ["research"],
        },
      ],
    },
    {
      id: "col-todo",
      title: "To Do",
      cards: [
        {
          id: "c3",
          title: "Implement CLI wrapper",
          description: "yargs-based CLI that auto-generates --help from Unapi definitions",
          priority: "medium",
          tags: ["cli"],
        },
      ],
    },
    {
      id: "col-progress",
      title: "In Progress",
      cards: [
        {
          id: "c4",
          title: "Project scaffolding",
          description: "Set up TypeScript, Vite, React, Tailwind, test runner",
          priority: "high",
          tags: ["setup"],
        },
      ],
    },
    {
      id: "col-done",
      title: "Done",
      cards: [
        {
          id: "c5",
          title: "Create GOALS.md",
          priority: "low",
          tags: ["docs"],
        },
      ],
    },
  ],
};

interface BoardProps {
  initial?: KanbanBoard;
}

export function Board({ initial = DEMO_BOARD }: BoardProps) {
  const [board, setBoard] = useState<KanbanBoard>(initial);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");

  function addCard(columnId: string, title: string) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col: KanbanColumn) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, { id: uid(), title }] }
          : col,
      ),
    }));
  }

  function deleteCard(columnId: string, cardId: string) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col: KanbanColumn) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col,
      ),
    }));
  }

  function handleAddColumn() {
    const title = newColTitle.trim();
    if (!title) return;
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: uid(), title, cards: [] }],
    }));
    setNewColTitle("");
    setAddingColumn(false);
  }

  function handleCancelColumn() {
    setAddingColumn(false);
    setNewColTitle("");
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-6 pb-8">
      {board.columns.map((col: KanbanColumn) => (
        <Column
          key={col.id}
          column={col}
          onAddCard={addCard}
          onDeleteCard={deleteCard}
        />
      ))}

      {addingColumn ? (
        <div
          className="flex w-72 shrink-0 flex-col gap-2 rounded-xl
            border border-dashed border-border-secondary bg-surface-secondary/50 p-4"
        >
          <Input
            placeholder="Column title..."
            value={newColTitle}
            onChange={setNewColTitle}
            onSubmit={handleAddColumn}
            onEscape={handleCancelColumn}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleAddColumn} size="sm">
              Add column
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelColumn}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingColumn(true)}
          className="flex h-12 w-72 shrink-0 items-center justify-center gap-2
            rounded-xl border border-dashed border-border-secondary
            text-sm text-text-tertiary transition-colors
            hover:border-border-primary hover:bg-surface-secondary hover:text-text-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add column
        </button>
      )}
    </div>
  );
}
