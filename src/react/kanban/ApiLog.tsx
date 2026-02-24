import type { ApiLogEntry } from "./useKanbanApi.js";
import type { RouterDescription } from "../../unapi/types.js";

interface ApiLogProps {
  entries: ApiLogEntry[];
  routerDescription: RouterDescription;
}

export function ApiLog({ entries, routerDescription }: ApiLogProps) {
  return (
    <div
      data-testid="api-log-panel"
      className="border-t border-border-primary bg-surface-secondary"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-border-primary">
        <h2 className="text-sm font-semibold text-text-primary">
          Unapi Procedure Log
        </h2>
        <span className="text-xs text-text-tertiary">
          {routerDescription.procedures.length} procedures registered
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-text-tertiary">
            Interact with the board to see Unapi procedure calls here.
          </div>
        ) : (
          <div className="divide-y divide-border-primary">
            {entries.map((entry) => (
              <div key={entry.id} className="px-6 py-2 text-xs font-mono" data-testid="api-log-entry">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 font-semibold text-brand">
                    {entry.procedure}
                  </span>
                  <span className="text-text-tertiary">
                    {new Date(entry.ts).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1 text-text-secondary truncate">
                  <span className="text-text-tertiary">in: </span>
                  {JSON.stringify(simplifyInput(entry.input))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border-primary px-6 py-2">
        <details className="text-xs">
          <summary className="cursor-pointer text-text-tertiary hover:text-text-secondary" data-testid="api-registry-toggle">
            Registered procedures ({routerDescription.procedures.length})
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {routerDescription.procedures.map((proc) => (
              <div key={proc.id} className="flex items-center gap-1.5 py-0.5" data-testid="api-registry-entry">
                <span className="font-mono font-medium text-text-primary">{proc.id}</span>
                <span className="text-text-tertiary">— {proc.meta.description}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

function simplifyInput(input: Record<string, unknown>): Record<string, unknown> {
  const simplified: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "boardId") continue;
    simplified[key] = value;
  }
  return simplified;
}
