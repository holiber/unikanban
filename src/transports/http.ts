import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Router, RouterShape } from "../unapi/index.js";

export interface HttpServerOptions {
  port?: number;
  host?: string;
  basePath?: string;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

export function createHttpServer<T extends RouterShape>(
  router: Router<T>,
  options?: HttpServerOptions,
) {
  const basePath = (options?.basePath ?? "/api").replace(/\/$/, "");

  const server = createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const pathname = url.pathname;

    if (pathname === `${basePath}/describe` && req.method === "GET") {
      sendJson(res, 200, router.describe());
      return;
    }

    const procMatch = pathname.match(new RegExp(`^${basePath}/call/(.+)$`));
    if (procMatch) {
      const procedureName = procMatch[1];
      if (!router.procedureNames.includes(procedureName as any)) {
        sendJson(res, 404, { error: `Unknown procedure: ${procedureName}` });
        return;
      }

      let input: Record<string, any> = {};
      if (req.method === "POST") {
        try {
          const body = await readBody(req);
          input = body ? JSON.parse(body) : {};
        } catch {
          sendJson(res, 400, { error: "Invalid JSON body" });
          return;
        }
      } else if (req.method === "GET") {
        for (const [key, value] of url.searchParams.entries()) {
          try {
            input[key] = JSON.parse(value);
          } catch {
            input[key] = value;
          }
        }
      }

      try {
        const result = await router.call(procedureName as any, input as any);
        sendJson(res, 200, { result });
      } catch (err: any) {
        const status = err.message?.includes("not found") ? 404 : 400;
        sendJson(res, status, { error: err.message });
      }
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  });

  const port = options?.port ?? 3100;
  const host = options?.host ?? "127.0.0.1";

  return {
    server,
    start: () =>
      new Promise<void>((resolve) => {
        server.listen(port, host, () => resolve());
      }),
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
    get address() {
      return `http://${host}:${port}`;
    },
    get basePath() {
      return basePath;
    },
  };
}
