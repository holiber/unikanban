import { ThemeProvider, ThemeToggle } from "./inc/index.js";
import { Board } from "./kanban/Board.js";

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
          <ThemeToggle />
        </header>

        {/* Board */}
        <main className="overflow-hidden">
          <Board />
        </main>
      </div>
    </ThemeProvider>
  );
}
