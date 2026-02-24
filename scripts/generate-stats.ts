import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname, relative } from "node:path";

interface FileInfo {
  path: string;
  size: number;
}

interface DependencyInfo {
  name: string;
  version: string;
  type: "runtime" | "dev";
}

interface Stats {
  package: {
    name: string;
    version: string;
    description: string;
  };
  dependencies: DependencyInfo[];
  source: {
    totalFiles: number;
    totalLines: number;
    byExtension: Record<string, { files: number; lines: number; bytes: number }>;
  };
  build: {
    files: FileInfo[];
    totalSize: number;
  };
  generatedAt: string;
}

function walkDir(dir: string, filter?: (f: string) => boolean): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "dist-app" || entry.name === "dist-tui") continue;
        results.push(...walkDir(fullPath, filter));
      } else if (!filter || filter(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch { /* ignore */ }
  return results;
}

function countLines(filePath: string): number {
  try {
    return readFileSync(filePath, "utf-8").split("\n").length;
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const rootDir = join(import.meta.dirname, "..");

const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8"));

const dependencies: DependencyInfo[] = [];
for (const [name, version] of Object.entries(pkg.dependencies || {})) {
  dependencies.push({ name, version: version as string, type: "runtime" });
}
for (const [name, version] of Object.entries(pkg.devDependencies || {})) {
  dependencies.push({ name, version: version as string, type: "dev" });
}

const sourceExts = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json"]);
const sourceFiles = walkDir(join(rootDir, "src"), (f) => sourceExts.has(extname(f)));

const byExtension: Record<string, { files: number; lines: number; bytes: number }> = {};
let totalLines = 0;

for (const file of sourceFiles) {
  const ext = extname(file);
  if (!byExtension[ext]) byExtension[ext] = { files: 0, lines: 0, bytes: 0 };
  const lines = countLines(file);
  const size = statSync(file).size;
  byExtension[ext].files++;
  byExtension[ext].lines += lines;
  byExtension[ext].bytes += size;
  totalLines += lines;
}

const buildFiles: FileInfo[] = [];
let buildTotalSize = 0;
try {
  const distFiles = walkDir(join(rootDir, "dist-app"));
  for (const file of distFiles) {
    const size = statSync(file).size;
    buildFiles.push({ path: relative(join(rootDir, "dist-app"), file), size });
    buildTotalSize += size;
  }
} catch { /* dist-app may not exist yet */ }

const stats: Stats = {
  package: {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  },
  dependencies,
  source: {
    totalFiles: sourceFiles.length,
    totalLines,
    byExtension,
  },
  build: {
    files: buildFiles,
    totalSize: buildTotalSize,
  },
  generatedAt: new Date().toISOString(),
};

mkdirSync(join(rootDir, "src/react/stats"), { recursive: true });
writeFileSync(
  join(rootDir, "src/react/stats/stats-data.json"),
  JSON.stringify(stats, null, 2),
);

console.log("Stats generated:");
console.log(`  Source: ${sourceFiles.length} files, ${totalLines} lines`);
console.log(`  Build: ${buildFiles.length} files, ${formatBytes(buildTotalSize)}`);
console.log(`  Dependencies: ${dependencies.length} (${dependencies.filter(d => d.type === "runtime").length} runtime, ${dependencies.filter(d => d.type === "dev").length} dev)`);
