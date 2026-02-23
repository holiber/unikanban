import { Box, Text } from "ink";
import { Badge } from "../inc/Badge.js";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "../inc/theme-colors.js";
import type { KanbanCard } from "../../inc/kanban-types.js";

interface CardItemProps {
  card: KanbanCard;
  focused?: boolean;
}

export function CardItem({ card, focused }: CardItemProps) {
  const { theme } = useTheme();
  const c = colors(theme);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={focused ? c.brand : c.border}
      paddingX={1}
    >
      <Text color={c.text} bold={focused}>
        {card.title}
      </Text>

      {card.description && (
        <Text color={c.textDim} wrap="truncate-end">
          {card.description}
        </Text>
      )}

      {(card.priority || card.tags?.length) && (
        <Box gap={1} marginTop={0}>
          {card.priority && (
            <Badge
              variant={
                card.priority === "high"
                  ? "danger"
                  : card.priority === "medium"
                    ? "warning"
                    : "success"
              }
            >
              {card.priority}
            </Badge>
          )}
          {card.tags?.map((tag) => (
            <Badge key={tag} variant="brand">
              {tag}
            </Badge>
          ))}
        </Box>
      )}
    </Box>
  );
}
