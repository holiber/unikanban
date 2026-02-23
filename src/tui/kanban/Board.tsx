import { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Column } from "./Column.js";
import { ThemeToggle } from "../inc/ThemeToggle.js";
import { useTheme } from "../../inc/useTheme.js";
import { colors } from "../inc/theme-colors.js";
import type { KanbanBoard, KanbanColumn } from "../../inc/kanban-types.js";

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
          description: "TypeScript-first API procedure declaration",
          priority: "high",
          tags: ["core"],
        },
        {
          id: "c2",
          title: "Research transport options",
          description: "Compare HTTP, stdio, IPC",
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
          description: "yargs-based CLI with auto --help",
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
          description: "TypeScript, Vite, React, Tailwind",
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
  const [board] = useState<KanbanBoard>(initial);
  const [colIdx, setColIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const { theme, toggle } = useTheme();
  const c = colors(theme);
  const { exit } = useApp();

  useInput((_input, key) => {
    if (key.escape || _input === "q") {
      exit();
      return;
    }

    if (_input === "t") {
      toggle();
      return;
    }

    if (key.leftArrow || _input === "h") {
      setColIdx((i) => Math.max(0, i - 1));
      setCardIdx(0);
      return;
    }
    if (key.rightArrow || _input === "l") {
      setColIdx((i) => Math.min(board.columns.length - 1, i + 1));
      setCardIdx(0);
      return;
    }
    if (key.upArrow || _input === "k") {
      setCardIdx((i) => Math.max(0, i - 1));
      return;
    }
    if (key.downArrow || _input === "j") {
      const maxCards = board.columns[colIdx]?.cards.length ?? 0;
      setCardIdx((i) => Math.min(maxCards - 1, i + 1));
      return;
    }
  });

  return (
    <Box flexDirection="column">
      <Box paddingX={1} justifyContent="space-between">
        <Text color={c.brand} bold>
          ◼ UniKanban
        </Text>
        <Box gap={2}>
          <ThemeToggle />
          <Text color={c.textMuted}>q:quit t:theme ←↑↓→:navigate</Text>
        </Box>
      </Box>

      <Box gap={0}>
        {board.columns.map((col: KanbanColumn, i: number) => (
          <Column
            key={col.id}
            column={col}
            focused={i === colIdx}
            focusedCardIndex={i === colIdx ? cardIdx : undefined}
          />
        ))}
      </Box>
    </Box>
  );
}
