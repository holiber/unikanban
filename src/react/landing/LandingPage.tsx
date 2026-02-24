import { ThemeProvider, ThemeToggle } from "../inc/index.js";

const BASE = import.meta.env.BASE_URL;

export function LandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface-primary transition-colors">
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

        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold text-text-primary">
              UniKanban
            </h2>
            <p className="mb-2 text-xl text-text-secondary">
              A Kanban board built with the Unapi pattern
            </p>
            <p className="mb-12 text-text-tertiary">
              Self-documented, type-safe, transport-agnostic APIs.
              One definition &mdash; CLI, HTTP, MCP, Browser UI, and TUI.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <a
              href={`${BASE}demo/`}
              className="group rounded-2xl border border-border-primary bg-surface-secondary
                p-8 transition-all hover:border-brand hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl
                  bg-brand/10 text-2xl transition-transform group-hover:scale-110"
              >
                <svg className="h-7 w-7 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="18" rx="1.5" />
                  <rect x="14" y="3" width="7" height="12" rx="1.5" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                Demo
              </h3>
              <p className="text-text-secondary">
                Try the interactive Kanban board. Create columns, add cards,
                drag between columns, and toggle themes.
              </p>
            </a>

            <a
              href={`${BASE}stats/`}
              className="group rounded-2xl border border-border-primary bg-surface-secondary
                p-8 transition-all hover:border-brand hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl
                  bg-success/10 text-2xl transition-transform group-hover:scale-110"
              >
                <svg className="h-7 w-7 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                Stats
              </h3>
              <p className="text-text-secondary">
                View package information, bundle sizes, dependency tree,
                and source code statistics.
              </p>
            </a>

            <a
              href={`${BASE}test-recordings/`}
              className="group rounded-2xl border border-border-primary bg-surface-secondary
                p-8 transition-all hover:border-brand hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl
                  bg-warning/10 text-2xl transition-transform group-hover:scale-110"
              >
                <svg className="h-7 w-7 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h3l2-2h6l2 2h3v12H4V7z" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                Test recordings
              </h3>
              <p className="text-text-secondary">
                Browse Playwright scenario videos and screenshots published from
                CI runs.
              </p>
            </a>
          </div>

          <div className="mt-16 text-center">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full bg-surface-tertiary px-3 py-1 text-sm text-text-secondary">
                React
              </span>
              <span className="rounded-full bg-surface-tertiary px-3 py-1 text-sm text-text-secondary">
                TypeScript
              </span>
              <span className="rounded-full bg-surface-tertiary px-3 py-1 text-sm text-text-secondary">
                Tailwind CSS
              </span>
              <span className="rounded-full bg-surface-tertiary px-3 py-1 text-sm text-text-secondary">
                Zod
              </span>
              <span className="rounded-full bg-surface-tertiary px-3 py-1 text-sm text-text-secondary">
                Ink (TUI)
              </span>
              <span className="rounded-full bg-surface-tertiary px-3 py-1 text-sm text-text-secondary">
                Vite
              </span>
            </div>
            <a
              href="https://github.com/holiber/unikanban"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand hover:text-brand-hover"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
