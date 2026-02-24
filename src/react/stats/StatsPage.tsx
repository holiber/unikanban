import { ThemeProvider, ThemeToggle } from "../inc/index.js";
import statsData from "./stats-data.json";

const BASE = import.meta.env.BASE_URL;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 mt-10 text-lg font-semibold text-text-primary first:mt-0">
      {children}
    </h3>
  );
}

export function StatsPage() {
  const { package: pkg, dependencies, source, build } = statsData;
  const runtimeDeps = dependencies.filter((d) => d.type === "runtime");
  const devDeps = dependencies.filter((d) => d.type === "dev");

  const extEntries = Object.entries(source.byExtension).sort(
    (a, b) => b[1].lines - a[1].lines,
  );

  const buildFilesSorted = [...build.files].sort((a, b) => b.size - a.size);

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
              <h1 className="text-lg font-semibold text-text-primary">
                UniKanban
              </h1>
            </a>
            <span className="rounded-md bg-surface-tertiary px-2 py-0.5 text-xs text-text-tertiary">
              Stats
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
              href={`${BASE}test-recordings/`}
              className="text-sm text-brand hover:text-brand-hover"
            >
              Test recordings
            </a>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">
          {/* Package info */}
          <div className="mb-8 rounded-2xl border border-border-primary bg-surface-secondary p-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-bold text-text-primary">{pkg.name}</h2>
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-sm font-medium text-brand">
                v{pkg.version}
              </span>
            </div>
            <p className="mt-2 text-text-secondary">{pkg.description}</p>
          </div>

          {/* Overview stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Source Files"
              value={String(source.totalFiles)}
              sub={`${source.totalLines.toLocaleString()} lines`}
            />
            <StatCard
              label="Build Size"
              value={formatBytes(build.totalSize)}
              sub={`${build.files.length} files`}
            />
            <StatCard
              label="Dependencies"
              value={String(runtimeDeps.length)}
              sub="runtime"
            />
            <StatCard
              label="Dev Dependencies"
              value={String(devDeps.length)}
              sub="development"
            />
          </div>

          {/* Source breakdown */}
          <SectionTitle>Source Code Breakdown</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-border-primary">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-primary bg-surface-tertiary">
                  <th className="px-4 py-3 font-medium text-text-secondary">Extension</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Files</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Lines</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Size</th>
                </tr>
              </thead>
              <tbody>
                {extEntries.map(([ext, info]) => (
                  <tr
                    key={ext}
                    className="border-b border-border-primary last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-text-primary">{ext}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{info.files}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {info.lines.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatBytes(info.bytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-secondary bg-surface-tertiary font-medium">
                  <td className="px-4 py-3 text-text-primary">Total</td>
                  <td className="px-4 py-3 text-right text-text-primary">{source.totalFiles}</td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {source.totalLines.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatBytes(
                      extEntries.reduce((sum, [, info]) => sum + info.bytes, 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Build output */}
          {build.files.length > 0 && (
            <>
              <SectionTitle>Build Output</SectionTitle>
              <div className="overflow-hidden rounded-xl border border-border-primary">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-primary bg-surface-tertiary">
                      <th className="px-4 py-3 font-medium text-text-secondary">File</th>
                      <th className="px-4 py-3 text-right font-medium text-text-secondary">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildFilesSorted.map((f) => (
                      <tr
                        key={f.path}
                        className="border-b border-border-primary last:border-0"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-text-primary">
                          {f.path}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-text-secondary">
                          {formatBytes(f.size)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border-secondary bg-surface-tertiary font-medium">
                      <td className="px-4 py-3 text-text-primary">Total</td>
                      <td className="px-4 py-3 text-right text-text-primary">
                        {formatBytes(build.totalSize)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          {/* Runtime dependencies */}
          <SectionTitle>Runtime Dependencies</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-border-primary">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-primary bg-surface-tertiary">
                  <th className="px-4 py-3 font-medium text-text-secondary">Package</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Version</th>
                </tr>
              </thead>
              <tbody>
                {runtimeDeps.map((dep) => (
                  <tr
                    key={dep.name}
                    className="border-b border-border-primary last:border-0"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`https://www.npmjs.com/package/${dep.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-brand hover:text-brand-hover"
                      >
                        {dep.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary">
                      {dep.version}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dev dependencies */}
          <SectionTitle>Dev Dependencies</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-border-primary">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-primary bg-surface-tertiary">
                  <th className="px-4 py-3 font-medium text-text-secondary">Package</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Version</th>
                </tr>
              </thead>
              <tbody>
                {devDeps.map((dep) => (
                  <tr
                    key={dep.name}
                    className="border-b border-border-primary last:border-0"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={dep.version.startsWith("http") ? dep.version : `https://www.npmjs.com/package/${dep.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-brand hover:text-brand-hover"
                      >
                        {dep.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                      {dep.version.length > 30
                        ? dep.version.slice(0, 30) + "..."
                        : dep.version}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 border-t border-border-primary pt-6 text-center text-xs text-text-tertiary">
            Generated at{" "}
            {new Date(statsData.generatedAt).toLocaleString()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
