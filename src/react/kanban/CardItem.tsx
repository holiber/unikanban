import { Badge, IconButton } from "../inc/index.js";
import type { KanbanCard } from "./types.js";

interface CardItemProps {
  card: KanbanCard;
  onDelete?: (id: string) => void;
}

const priorityVariant = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const;

export function CardItem({ card, onDelete }: CardItemProps) {
  return (
    <div
      className="group rounded-lg border border-border-primary bg-surface-primary
        p-3 shadow-sm transition-all hover:shadow-md hover:border-border-secondary"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-text-primary leading-snug">
          {card.title}
        </h4>
        <IconButton
          label="Delete card"
          size="sm"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete?.(card.id)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
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
    </div>
  );
}
