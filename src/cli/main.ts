import { createKanbanApi } from "../domain/index.js";
import { createCli } from "./index.js";
import { createHttpCaller } from "../transports/http-client.js";

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

const { router } = createKanbanApi();

const extracted = extractRemote(process.argv.slice(2));
if (extracted.remoteApiBaseUrl) {
  process.argv.splice(2, process.argv.length - 2, ...extracted.rest);
}

const remoteApiBaseUrl =
  extracted.remoteApiBaseUrl ?? process.env.UNIKANBAN_REMOTE_API_BASE_URL;

const call = remoteApiBaseUrl
  ? createHttpCaller({ apiBaseUrl: normalizeApiBaseUrl(remoteApiBaseUrl) })
  : undefined;

const cli = createCli(router, { call });
cli.parse();
