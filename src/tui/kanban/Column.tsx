import { Box, Text } from "ink";
import { Badge } from "../inc/Badge.js";
import { CardItem } from "./CardItem.js";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "../inc/theme-colors.js";
import type { KanbanCard, KanbanColumn } from "../../inc/kanban-types.js";

interface ColumnProps {
  column: KanbanColumn;
  focused?: boolean;
  focusedCardIndex?: number;
}

export function Column({ column, focused, focusedCardIndex }: ColumnProps) {
  const { theme } = useTheme();
  const c = colors(theme);

  return (
    <Box
      flexDirection="column"
      width={30}
      borderStyle="single"
      borderColor={focused ? c.brand : c.border}
    >
      <Box paddingX={1} justifyContent="space-between">
        <Text color={focused ? c.brand : c.text} bold>
          {column.title}
        </Text>
        <Badge>{column.cards.length}</Badge>
      </Box>

      <Box flexDirection="column" paddingX={1} gap={0}>
        {column.cards.length === 0 ? (
          <Text color={c.textMuted} italic>
            {"  (empty)"}
          </Text>
        ) : (
          column.cards.map((card: KanbanCard, i: number) => (
            <CardItem
              key={card.id}
              card={card}
              focused={focused && i === focusedCardIndex}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
