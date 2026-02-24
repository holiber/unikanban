import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";

type AssetType = "video" | "screenshot" | "trace" | "other";

type RecordingAsset = {
  type: AssetType;
  /** Relative to Vite `base` (no leading slash). */
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

const rootDir = join(import.meta.dirname, "..");

const sourceDir = process.env.PLAYWRIGHT_RESULTS_DIR
  ? join(rootDir, process.env.PLAYWRIGHT_RESULTS_DIR)
  : join(rootDir, ".cache/tests/playwright-results");

const outDir = process.env.TEST_RECORDINGS_OUT_DIR
  ? join(rootDir, process.env.TEST_RECORDINGS_OUT_DIR)
  : join(rootDir, "dist-app/test-recordings");

const outAssetsDir = join(outDir, "assets");

const allowedExts = new Set([
  ".webm",
  ".mp4",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".zip",
  ".txt",
  ".log",
]);

function walkDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function toPosixPath(p: string): string {
  return p.split(sep).join("/");
}

function assetTypeFromExt(ext: string): AssetType {
  if (ext === ".webm" || ext === ".mp4") return "video";
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".gif")
    return "screenshot";
  if (ext === ".zip") return "trace";
  return "other";
}

function typeOrder(type: AssetType): number {
  switch (type) {
    case "video":
      return 0;
    case "screenshot":
      return 1;
    case "trace":
      return 2;
    default:
      return 3;
  }
}

mkdirSync(outDir, { recursive: true });
if (existsSync(outAssetsDir)) rmSync(outAssetsDir, { recursive: true, force: true });
mkdirSync(outAssetsDir, { recursive: true });

const groups = new Map<string, RecordingGroup>();
let totalBytes = 0;
let totalFiles = 0;

if (existsSync(sourceDir)) {
  const allFiles = walkDir(sourceDir);
  for (const file of allFiles) {
    const ext = extname(file).toLowerCase();
    if (!allowedExts.has(ext)) continue;

    const st = statSync(file);
    if (!st.isFile()) continue;

    totalFiles += 1;
    totalBytes += st.size;

    const rel = relative(sourceDir, file);
    const relPosix = toPosixPath(rel);

    const destPath = join(outAssetsDir, rel);
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(file, destPath);

    const groupId = relPosix.includes("/") ? relPosix.split("/", 1)[0] : "(root)";
    const group = groups.get(groupId) ?? {
      id: groupId,
      newestMtimeMs: 0,
      assets: [],
    };

    const asset: RecordingAsset = {
      type: assetTypeFromExt(ext),
      path: `test-recordings/assets/${relPosix}`,
      originalPath: relPosix,
      name: basename(file),
      sizeBytes: st.size,
      mtimeMs: st.mtimeMs,
    };

    group.assets.push(asset);
    group.newestMtimeMs = Math.max(group.newestMtimeMs, asset.mtimeMs);
    groups.set(groupId, group);
  }
}

const groupsSorted: RecordingGroup[] = [...groups.values()]
  .map((g) => ({
    ...g,
    assets: [...g.assets].sort((a, b) => {
      const dType = typeOrder(a.type) - typeOrder(b.type);
      if (dType !== 0) return dType;
      return b.mtimeMs - a.mtimeMs;
    }),
  }))
  .sort((a, b) => b.newestMtimeMs - a.newestMtimeMs);

const index: RecordingsIndex = {
  generatedAt: new Date().toISOString(),
  gitSha: process.env.GITHUB_SHA,
  runId: process.env.GITHUB_RUN_ID,
  totalFiles,
  totalBytes,
  groups: groupsSorted,
};

writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2));

console.log("Test recordings index generated:");
console.log(`  Source: ${existsSync(sourceDir) ? sourceDir : "(missing)"} `);
console.log(`  Output: ${outDir}`);
console.log(`  Files: ${totalFiles}`);

