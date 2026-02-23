export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
}
