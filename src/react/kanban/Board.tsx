import { useState } from "react";
import { Button, Input } from "../inc/index.js";
import { Column } from "./Column.js";
import { ApiLog } from "./ApiLog.js";
import { useKanbanApi } from "./useKanbanApi.js";
import type { KanbanColumn } from "./types.js";

export function Board() {
  const {
    board,
    log,
    addCard,
    deleteCard,
    addColumn,
    moveCard,
    routerDescription,
  } = useKanbanApi();

  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [showApiLog, setShowApiLog] = useState(false);

  function handleAddColumn() {
    const title = newColTitle.trim();
    if (!title) return;
    addColumn(title);
    setNewColTitle("");
    setAddingColumn(false);
  }

  function handleCancelColumn() {
    setAddingColumn(false);
    setNewColTitle("");
  }

  function handleMoveCard(sourceColumnId: string, targetColumnId: string, cardId: string) {
    moveCard(sourceColumnId, targetColumnId, cardId);
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-end px-6 pt-2">
        <button
          onClick={() => setShowApiLog(!showApiLog)}
          data-testid="toggle-api-log"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5
            text-xs font-medium transition-colors
            bg-surface-secondary border border-border-primary
            text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          {showApiLog ? "Hide" : "Show"} API Log
          {log.length > 0 && (
            <span className="ml-1 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
              {log.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto p-6 pb-8">
        {board.columns.map((col: KanbanColumn) => (
          <Column
            key={col.id}
            column={col}
            allColumns={board.columns}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onMoveCard={handleMoveCard}
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

      {showApiLog && (
        <ApiLog entries={log} routerDescription={routerDescription} />
      )}
    </div>
  );
}
