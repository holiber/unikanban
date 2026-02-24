import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, ThemeToggle } from "../inc/index.js";

type AssetType = "video" | "screenshot" | "trace" | "other";

type RecordingAsset = {
  type: AssetType;
  /** Relative to `import.meta.env.BASE_URL` (no leading slash). */
  path: string;
  /** Original path inside Playwright outputDir (posix-style). */
  originalPath: string;
  name: string;
  sizeBytes: number;
  mtimeMs: number;
};

type RecordingGroup = {
  id: string;
  newestMtimeMs: number;
  assets: RecordingAsset[];
};

type RecordingsIndex = {
  generatedAt: string;
  gitSha?: string;
  runId?: string;
  totalFiles: number;
  totalBytes: number;
  groups: RecordingGroup[];
};

const BASE = import.meta.env.BASE_URL;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString();
}

function typeBadge(type: AssetType): { label: string; cls: string } {
  switch (type) {
    case "video":
      return { label: "Video", cls: "bg-brand/10 text-brand" };
    case "screenshot":
      return { label: "Screenshot", cls: "bg-success/10 text-success" };
    case "trace":
      return { label: "Trace", cls: "bg-warning/10 text-warning" };
    default:
      return { label: "File", cls: "bg-surface-tertiary text-text-secondary" };
  }
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border-primary bg-surface-secondary p-5">
      <div className="text-sm text-text-tertiary">{label}</div>
      <div className="mt-1 text-2xl font-bold text-text-primary">{value}</div>
      {sub && <div className="mt-1 text-xs text-text-tertiary">{sub}</div>}
    </div>
  );
}

function buildAssetUrl(path: string): string {
  return `${BASE}${path}`;
}

export function TestRecordingsPage() {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<RecordingsIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(buildAssetUrl("test-recordings/index.json"));
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json = (await res.json()) as RecordingsIndex;
        if (!cancelled) setIndex(json);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
          setIndex(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = index?.groups ?? [];
    if (!q) return groups;
    return groups
      .map((g) => {
        const assets = g.assets.filter(
          (a) =>
            g.id.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.originalPath.toLowerCase().includes(q),
        );
        return assets.length ? { ...g, assets } : null;
      })
      .filter((g): g is RecordingGroup => g !== null);
  }, [index, query]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface-primary transition-colors">
        <header
          className="sticky top-0 z-10 flex items-center justify-between
            border-b border-border-primary bg-surface-primary/80 px-6 py-3
            backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <a href={BASE} className="flex items-center gap-3 hover:opacity-80">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg
                  bg-brand text-sm font-bold text-white"
              >
                U
              </div>
              <h1 className="text-lg font-semibold text-text-primary">UniKanban</h1>
            </a>
            <span className="rounded-md bg-surface-tertiary px-2 py-0.5 text-xs text-text-tertiary">
              Test Recordings
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE}demo/`}
              className="text-sm text-brand hover:text-brand-hover"
            >
              Demo
            </a>
            <a
              href={`${BASE}stats/`}
              className="text-sm text-brand hover:text-brand-hover"
            >
              Stats
            </a>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8 rounded-2xl border border-border-primary bg-surface-secondary p-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Scenario test artifacts
            </h2>
            <p className="mt-2 text-text-secondary">
              Videos, screenshots, and traces collected from Playwright runs and
              published to GitHub Pages.
            </p>
            {index?.gitSha && (
              <div className="mt-3 text-xs text-text-tertiary">
                Git SHA:{" "}
                <span className="font-mono text-text-secondary">
                  {index.gitSha.slice(0, 12)}
                </span>
                {index.runId && (
                  <>
                    {" "}
                    · Run:{" "}
                    <span className="font-mono text-text-secondary">{index.runId}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Groups"
              value={String(index?.groups.length ?? 0)}
              sub="Test output folders"
            />
            <StatCard
              label="Files"
              value={String(index?.totalFiles ?? 0)}
              sub="Videos + images + traces"
            />
            <StatCard
              label="Total Size"
              value={formatBytes(index?.totalBytes ?? 0)}
              sub="Published to Pages"
            />
            <StatCard
              label="Generated"
              value={index ? new Date(index.generatedAt).toLocaleDateString() : "—"}
              sub={index ? new Date(index.generatedAt).toLocaleTimeString() : undefined}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by test name, file name, or path…"
                className="w-full rounded-lg border border-border-primary bg-surface-primary
                  px-3 py-2 text-sm text-text-primary outline-none
                  placeholder:text-text-tertiary focus:border-border-accent sm:w-96"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-sm text-text-tertiary hover:text-text-secondary"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-text-tertiary">
              {loading && "Loading…"}
              {!loading && error && (
                <span className="text-danger">
                  Failed to load index.json: {error}
                </span>
              )}
              {!loading && !error && index && filteredGroups.length === 0 && (
                <span>No matches.</span>
              )}
              {!loading && !error && !index && <span>No data.</span>}
            </div>
          </div>

          {!loading && !error && index && filteredGroups.length === 0 && (
            <div className="mt-8 rounded-xl border border-border-primary bg-surface-secondary p-6 text-text-secondary">
              No recordings found. If this is a fresh deploy, scenario tests may not
              have produced artifacts yet.
            </div>
          )}

          <div className="mt-8 space-y-4">
            {filteredGroups.map((g) => (
              <details
                key={g.id}
                className="rounded-2xl border border-border-primary bg-surface-secondary"
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4
                    px-6 py-4"
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-sm text-text-primary">
                      {g.id}
                    </div>
                    <div className="mt-1 text-xs text-text-tertiary">
                      {g.assets.length} files · newest {formatDateTime(g.newestMtimeMs)}
                    </div>
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Click to expand
                  </div>
                </summary>

                <div className="border-t border-border-primary px-6 py-5">
                  <div className="space-y-6">
                    {g.assets.map((a) => {
                      const badge = typeBadge(a.type);
                      const url = buildAssetUrl(a.path);
                      return (
                        <div key={a.path} className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                            <span className="font-mono text-xs text-text-secondary">
                              {a.name}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {formatBytes(a.sizeBytes)} · {formatDateTime(a.mtimeMs)}
                            </span>
                          </div>

                          <div className="text-xs text-text-tertiary">
                            <span className="font-mono">{a.originalPath}</span>{" "}
                            ·{" "}
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand hover:text-brand-hover"
                            >
                              Open
                            </a>{" "}
                            ·{" "}
                            <a
                              href={url}
                              download
                              className="text-brand hover:text-brand-hover"
                            >
                              Download
                            </a>
                          </div>

                          {a.type === "video" && (
                            <video
                              controls
                              preload="metadata"
                              className="w-full max-w-4xl rounded-xl border border-border-primary bg-black"
                              src={url}
                            />
                          )}

                          {a.type === "screenshot" && (
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                loading="lazy"
                                className="w-full max-w-4xl rounded-xl border border-border-primary bg-surface-primary"
                                src={url}
                                alt={a.name}
                              />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

