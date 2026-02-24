import type { Card } from "./schemas.js";

export interface MermaidKanbanSeed {
  title: string;
  columns: Array<{
    title: string;
    cards: Array<{
      title: string;
      description?: string;
      priority?: Card["priority"];
      tags?: string[];
    }>;
  }>;
}

function stripCodeFences(input: string): string {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith("```")) continue;
    out.push(line);
  }
  return out.join("\n");
}

function parseFrontmatterTitle(lines: string[]): string | undefined {
  if (lines[0]?.trim() !== "---") return undefined;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === "---") break;
    const m = line.match(/^\s*title\s*:\s*(.+)\s*$/i);
    if (m) return m[1]!.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1").trim();
  }
  return undefined;
}

function leadingSpaces(line: string): number {
  const m = line.match(/^(\s*)/);
  return m ? m[1]!.length : 0;
}

function parseCardTitle(raw: string): {
  title: string;
  description?: string;
  priority?: Card["priority"];
  tags?: string[];
} {
  let s = raw.trim();

  // Mermaid examples often show card titles as [Title], and we allow trailing metadata tokens.
  if (s.startsWith("[")) {
    const end = s.indexOf("]");
    if (end > 0) {
      const inside = s.slice(1, end).trim();
      const tail = s.slice(end + 1).trim();
      s = tail ? `${inside} ${tail}` : inside;
    }
  }

  let priority: Card["priority"] | undefined;
  s = s.replace(/(^|\s)!(low|medium|high)(?=\s|$)/gi, (m, p1, p2) => {
    priority = String(p2).toLowerCase() as Card["priority"];
    return String(p1 ?? "");
  });

  let description: string | undefined;
  const descSplit = s.split(" - ");
  if (descSplit.length >= 2) {
    s = descSplit[0]!.trim();
    description = descSplit.slice(1).join(" - ").trim() || undefined;
  }

  // Extract #tags (non-destructive, keep title readable)
  const tags = Array.from(s.matchAll(/(^|\s)#([a-z0-9_-]+)/gi)).map((m) => m[2]!.toLowerCase());
  const title = s.replace(/(^|\s)#([a-z0-9_-]+)/gi, "").replace(/\s{2,}/g, " ").trim();

  return {
    title,
    ...(description ? { description } : {}),
    ...(priority ? { priority } : {}),
    ...(tags.length ? { tags } : {}),
  };
}

export function parseMermaidKanban(input: string): MermaidKanbanSeed {
  const cleaned = stripCodeFences(input).trim();
  if (!cleaned) throw new Error("Empty Mermaid input");

  const lines = cleaned.split("\n");
  const title = parseFrontmatterTitle(lines) ?? "Imported Kanban";

  const startIdx = lines.findIndex((l) => l.trim() === "kanban" || l.trim().startsWith("kanban "));
  if (startIdx === -1) {
    throw new Error("Mermaid input does not contain a 'kanban' block");
  }

  const columns: MermaidKanbanSeed["columns"] = [];
  let current: MermaidKanbanSeed["columns"][number] | undefined;

  for (let i = startIdx + 1; i < lines.length; i++) {
    const raw = lines[i]!;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("%%")) continue; // Mermaid comment
    if (trimmed === "---") continue; // frontmatter delimiter if present later

    const indent = leadingSpaces(raw);

    // Column headers are usually top-level under `kanban` (often indented by 2 spaces).
    if (indent <= 2) {
      current = { title: trimmed, cards: [] };
      columns.push(current);
      continue;
    }

    if (!current) continue;

    const card = parseCardTitle(trimmed);
    if (!card.title) continue;
    current.cards.push({
      title: card.title,
      ...(card.description ? { description: card.description } : {}),
      ...(card.priority ? { priority: card.priority } : {}),
      ...(card.tags ? { tags: card.tags } : {}),
    });
  }

  if (columns.length === 0) {
    throw new Error("Mermaid kanban block contains no columns");
  }

  return { title, columns };
}

