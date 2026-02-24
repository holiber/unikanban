import { useState } from "react";
import { Badge, IconButton } from "../inc/index.js";
import type { KanbanCard, KanbanColumn } from "./types.js";

interface CardItemProps {
  card: KanbanCard;
  onDelete?: (id: string) => void;
  onMove?: (cardId: string, targetColumnId: string) => void;
  otherColumns?: KanbanColumn[];
}

const priorityVariant = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const;

export function CardItem({ card, onDelete, onMove, otherColumns }: CardItemProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div
      className="group relative rounded-lg border border-border-primary bg-surface-primary
        p-3 shadow-sm transition-all hover:shadow-md hover:border-border-secondary"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-text-primary leading-snug">
          {card.title}
        </h4>
        <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onMove && otherColumns && otherColumns.length > 0 && (
            <IconButton
              label="Move card"
              size="sm"
              onClick={() => setShowMoveMenu(!showMoveMenu)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </IconButton>
          )}
          <IconButton
            label="Delete card"
            size="sm"
            onClick={() => onDelete?.(card.id)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
      </div>

      {card.description && (
        <p className="mt-1.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {card.priority && (
          <Badge variant={priorityVariant[card.priority]}>
            {card.priority}
          </Badge>
        )}
        {card.tags?.map((tag) => (
          <Badge key={tag} variant="brand">{tag}</Badge>
        ))}
      </div>

      {showMoveMenu && otherColumns && (
        <div className="absolute top-full left-0 z-20 mt-1 w-48 rounded-lg border
          border-border-primary bg-surface-primary shadow-lg" data-testid="move-menu">
          <div className="p-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
              Move to
            </div>
            {otherColumns.map((col) => (
              <button
                key={col.id}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs text-text-primary
                  hover:bg-surface-hover transition-colors"
                data-testid={`move-to-${col.title.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => {
                  onMove?.(card.id, col.id);
                  setShowMoveMenu(false);
                }}
              >
                {col.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
