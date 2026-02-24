import { ThemeProvider, ThemeToggle } from "./inc/index.js";
import { Board } from "./kanban/Board.js";

const BASE = import.meta.env.BASE_URL;

export function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface-primary transition-colors">
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between
            border-b border-border-primary bg-surface-primary/80 px-6 py-3
            backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg
                bg-brand text-sm font-bold text-white"
            >
              U
            </div>
            <h1 className="text-lg font-semibold text-text-primary">
              UniKanban
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE}stats/`}
              className="text-sm text-brand hover:text-brand-hover"
            >
              Stats
            </a>
            <a
              href={`${BASE}test-recordings/`}
              className="text-sm text-brand hover:text-brand-hover"
            >
              Test recordings
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* Board */}
        <main className="overflow-hidden">
          <Board />
        </main>
      </div>
    </ThemeProvider>
  );
}
