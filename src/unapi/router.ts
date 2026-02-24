import type {
  RouterShape,
  RouterDescription,
  ProcedureInfo,
  InferInput,
  InferOutput,
  ClientShape,
} from "./types.js";

export class Router<T extends RouterShape> {
  readonly procedures: T;

  constructor(procedures: T) {
    this.procedures = procedures;
  }

  async call<K extends string & keyof T>(
    name: K,
    input: InferInput<T[K]>,
  ): Promise<InferOutput<T[K]>> {
    const procedure = this.procedures[name];
    if (!procedure) {
      throw new Error(`Unknown procedure: ${name}`);
    }

    const parsed = procedure.input.parse(input);
    const result = await procedure.handler(parsed);
    return procedure.output.parse(result) as InferOutput<T[K]>;
  }

  describe(): RouterDescription {
    const procedures: ProcedureInfo[] = Object.entries(this.procedures).map(
      ([name, proc]) => ({
        name,
        description: proc.meta.description,
        tags: proc.meta.tags ?? [],
        inputSchema: proc.input,
        outputSchema: proc.output,
      }),
    );
    return { procedures };
  }

  get procedureNames(): (string & keyof T)[] {
    return Object.keys(this.procedures) as (string & keyof T)[];
  }
}

export function createRouter<T extends RouterShape>(procedures: T): Router<T> {
  return new Router(procedures);
}

export function createClient<T extends RouterShape>(
  router: Router<T>,
): ClientShape<T> {
  const client = {} as ClientShape<T>;
  for (const name of router.procedureNames) {
    (client as Record<string, Function>)[name] = (input: unknown) =>
      router.call(name, input as InferInput<T[typeof name]>);
  }
  return client;
}
