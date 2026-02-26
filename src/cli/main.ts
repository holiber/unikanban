import { createKanbanApi } from "../domain/index.js";
import { createCli } from "./index.js";
import { createHttpCaller } from "../transports/http-client.js";
import { runInteractiveCli } from "./interactive.js";
import { KANBAN_EVENT_NAMES } from "../domain/store.js";

function extractRemote(args: string[]): { remoteApiBaseUrl?: string; rest: string[] } {
  const rest: string[] = [];
  let remoteApiBaseUrl: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--remote" || a === "--remoteApiBaseUrl" || a === "--remote-api-base-url") {
      remoteApiBaseUrl = args[i + 1];
      i += 1;
      continue;
    }
    const m = a.match(/^--remote(?:ApiBaseUrl|api-base-url)?=(.+)$/);
    if (m) {
      remoteApiBaseUrl = m[1];
      continue;
    }
    rest.push(a);
  }

  return { remoteApiBaseUrl, rest };
}

function normalizeApiBaseUrl(input: string): string {
  const u = input.replace(/\/+$/, "");
  return u.endsWith("/api") ? u : `${u}/api`;
}

const { router, store } = createKanbanApi();

const extracted = extractRemote(process.argv.slice(2));
if (extracted.remoteApiBaseUrl) {
  process.argv.splice(2, process.argv.length - 2, ...extracted.rest);
}

const remoteApiBaseUrl =
  extracted.remoteApiBaseUrl ?? process.env.UNIKANBAN_REMOTE_API_BASE_URL;

const call = remoteApiBaseUrl
  ? createHttpCaller({ apiBaseUrl: normalizeApiBaseUrl(remoteApiBaseUrl) })
  : undefined;

const wantsInteractive =
  process.argv.includes("--interactive") ||
  process.argv.includes("-i") ||
  process.argv.slice(2)[0] === "repl";

if (wantsInteractive) {
  // Remove the interactive marker so yargs doesn't choke on unknown flags/command.
  process.argv = process.argv.filter((a, idx) => {
    if (a === "--interactive" || a === "-i") return false;
    if (idx === 2 && a === "repl") return false;
    return true;
  });

  await runInteractiveCli({
    router,
    call,
    events: remoteApiBaseUrl ? undefined : store.events,
    knownEventNames: KANBAN_EVENT_NAMES,
  });
} else {
  const cli = createCli(router, { call });
  cli.parse();
}
