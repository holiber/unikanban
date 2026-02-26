import type { Router, RouterShape } from "../unapi/index.js";
import type { RouterDescription } from "../unapi/types.js";

export interface ProcedureFilter {
  /**
   * Allow-list of procedure IDs or namespaces.
   *
   * Examples:
   * - ["board"] allows all `board.*` procedures
   * - ["board.create"] allows only `board.create` (and deeper prefixes, if any)
   *
   * If omitted or empty, everything is allowed (unless denied).
   */
  allow?: string[];
  /**
   * Deny-list of procedure IDs or namespaces.
   *
   * Denies take precedence over allows.
   */
  deny?: string[];
}

export interface RpcBridgeOptions {
  procedures?: ProcedureFilter;
}

export interface RpcRequest {
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface RpcResponse {
  id: string | number;
  result?: unknown;
  error?: { message: string; code?: number };
}

function matchesNamespace(id: string, pattern: string): boolean {
  if (id === pattern) return true;
  return id.startsWith(pattern.endsWith(".") ? pattern : `${pattern}.`);
}

function isAllowedByFilter(id: string, filter?: ProcedureFilter): boolean {
  const allow = (filter?.allow ?? []).filter(Boolean);
  const deny = (filter?.deny ?? []).filter(Boolean);

  const denied = deny.some((p) => matchesNamespace(id, p));
  if (denied) return false;

  if (allow.length === 0) return true;
  return allow.some((p) => matchesNamespace(id, p));
}

export function createRpcBridge<T extends RouterShape>(
  router: Router<T>,
  options?: RpcBridgeOptions,
) {
  const exposedCanonicalIds = new Set(
    router.procedureIds.filter((id) =>
      isAllowedByFilter(String(id), options?.procedures),
    ),
  );

  const exposedAliases = new Set(
    Object.entries(router.aliases)
      .filter(([, canonical]) => exposedCanonicalIds.has(canonical))
      .map(([alias]) => alias),
  );

  function resolveCanonicalId(nameOrAlias: string): string {
    return router.aliases[nameOrAlias] ?? nameOrAlias;
  }

  function isExposedProcedure(nameOrAlias: string): boolean {
    const canonical = resolveCanonicalId(nameOrAlias);
    return exposedCanonicalIds.has(canonical) || exposedAliases.has(nameOrAlias);
  }

  function listProcedures(): { procedures: string[] } {
    const canonical = [...exposedCanonicalIds].sort();
    const aliases = [...exposedAliases].sort();
    return { procedures: [...canonical, ...aliases] };
  }

  function describe(): RouterDescription {
    const full = router.describe();
    return {
      procedures: full.procedures.filter((p) => exposedCanonicalIds.has(p.id)),
    };
  }

  async function handleRequest(req: RpcRequest): Promise<RpcResponse> {
    if (req.method === "describe") {
      return { id: req.id, result: describe() };
    }

    if (req.method === "list") {
      return { id: req.id, result: listProcedures() };
    }

    if (!router.hasProcedure(req.method)) {
      return {
        id: req.id,
        error: { message: `Unknown procedure: ${req.method}`, code: -32601 },
      };
    }

    const canonical = resolveCanonicalId(req.method);
    if (!isAllowedByFilter(canonical, options?.procedures)) {
      return {
        id: req.id,
        error: { message: `Procedure not exposed: ${req.method}`, code: -32601 },
      };
    }

    try {
      const result = await router.call(req.method as any, (req.params ?? {}) as any);
      return { id: req.id, result };
    } catch (err: any) {
      return {
        id: req.id,
        error: { message: err?.message ?? String(err), code: -32000 },
      };
    }
  }

  return {
    resolveCanonicalId,
    isExposedProcedure,
    listProcedures,
    describe,
    handleRequest,
  };
}

