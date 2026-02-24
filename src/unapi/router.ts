import type {
  RouterShape,
  RouterDescription,
  ProcedureInfo,
  InferInput,
  InferOutput,
  UnapiClient,
} from "./types.js";

export class Router<T extends RouterShape> {
  readonly procedures: T;
  readonly aliases: Readonly<Record<string, string>>;

  constructor(procedures: T, options?: { aliases?: Record<string, string> }) {
    this.procedures = procedures;
    this.aliases = options?.aliases ?? {};
  }

  private resolveId(nameOrAlias: string): string {
    return this.aliases[nameOrAlias] ?? nameOrAlias;
  }

  hasProcedure(nameOrAlias: string): boolean {
    const id = this.resolveId(nameOrAlias);
    return Boolean((this.procedures as Record<string, unknown>)[id]);
  }

  async call<K extends string & keyof T>(
    nameOrId: K,
    input: InferInput<T[K]>,
  ): Promise<InferOutput<T[K]>>;
  async call(nameOrAlias: string, input: unknown): Promise<unknown>;
  async call(nameOrAlias: string, input: unknown): Promise<unknown> {
    const id = this.resolveId(nameOrAlias);
    const procedure = (this.procedures as Record<string, any>)[id];
    if (!procedure) {
      throw new Error(`Unknown procedure: ${nameOrAlias}`);
    }

    const parsed = procedure.input.parse(input);
    const result = await procedure.handler(parsed);
    return procedure.output.parse(result);
  }

  describe(): RouterDescription {
    const aliasToCanonical = this.aliases;
    const canonicalToAliases: Record<string, string[]> = {};
    for (const [alias, canonical] of Object.entries(aliasToCanonical)) {
      (canonicalToAliases[canonical] ??= []).push(alias);
    }

    const procedures: ProcedureInfo[] = Object.entries(this.procedures).map(
      ([id, proc]) => ({
        id,
        meta: proc.meta,
        inputSchema: proc.input,
        outputSchema: proc.output,
        aliases: canonicalToAliases[id],
      }),
    );
    return { procedures };
  }

  get procedureIds(): (string & keyof T)[] {
    return Object.keys(this.procedures) as (string & keyof T)[];
  }

  get procedureNames(): string[] {
    return [...this.procedureIds, ...Object.keys(this.aliases)];
  }
}

export function createRouter<T extends RouterShape>(
  procedures: T,
  options?: { aliases?: Record<string, string> },
): Router<T> {
  return new Router(procedures, options);
}

export function createClient<T extends RouterShape>(
  router: Router<T>,
): UnapiClient<T> {
  return createCallerClient(
    router.procedureIds,
    (procedureName, input) => router.call(procedureName as any, input),
    { aliases: router.aliases },
  );
}

export type UnapiCaller = (
  procedureName: string,
  input: unknown,
) => Promise<unknown>;

export function createCallerClient<T extends RouterShape>(
  procedureIds: readonly (string & keyof T)[],
  call: UnapiCaller,
  options?: { aliases?: Record<string, string> },
): UnapiClient<T> {
  const client: Record<string, any> = {};

  // Canonical IDs: `board.create` -> client.board.create(...) + client["board.create"](...)
  for (const id of procedureIds) {
    const fn = (input: unknown) => call(String(id), input);
    client[id] = fn;

    const segments = String(id).split(".");
    let cursor = client;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]!;
      cursor[seg] ??= {};
      cursor = cursor[seg];
    }
    cursor[segments[segments.length - 1]!] = fn;
  }

  // Aliases: keep backward-compatible flat names (e.g. `createBoard`)
  for (const [alias, canonical] of Object.entries(options?.aliases ?? {})) {
    client[alias] = (input: unknown) => call(canonical, input);
  }

  return client as UnapiClient<T>;
}
