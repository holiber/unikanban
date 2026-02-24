import type { RouterDescription } from "../unapi/types.js";
import type { UnapiCaller } from "../unapi/router.js";

export interface HttpClientOptions {
  /**
   * Base URL including the API base path.
   *
   * Examples:
   * - http://127.0.0.1:3100/api
   * - https://example.com/unikanban/api
   */
  apiBaseUrl: string;
  headers?: Record<string, string>;
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export function createHttpCaller(options: HttpClientOptions): UnapiCaller {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  return async (procedureName: string, input: unknown) => {
    const url = joinUrl(options.apiBaseUrl, `call/${encodeURIComponent(procedureName)}`);
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(input ?? {}),
    });
    const data = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(data?.error ?? `HTTP ${res.status}`);
    }
    if (data?.error) {
      throw new Error(String(data.error));
    }
    return data?.result;
  };
}

export async function fetchHttpDescription(
  options: HttpClientOptions,
): Promise<RouterDescription> {
  const url = joinUrl(options.apiBaseUrl, "describe");
  const res = await fetch(url, { headers: options.headers });
  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data as RouterDescription;
}

