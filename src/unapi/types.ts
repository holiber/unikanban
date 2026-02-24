import type { z } from "zod";

export interface ProcedureMeta {
  description: string;
  tags?: string[];
}

export interface ProcedureDefinition<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  meta: ProcedureMeta;
  input: TInput;
  output: TOutput;
  handler: (input: z.infer<TInput>) => Promise<z.infer<TOutput>> | z.infer<TOutput>;
}

export type AnyProcedure = ProcedureDefinition<z.ZodType, z.ZodType>;

export type RouterShape = Record<string, AnyProcedure>;

export interface ProcedureInfo {
  id: string;
  meta: ProcedureMeta;
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
  aliases?: string[];
}

export interface RouterDescription {
  procedures: ProcedureInfo[];
}

export type InferInput<P> = P extends ProcedureDefinition<infer I, any>
  ? z.infer<I>
  : never;

export type InferOutput<P> = P extends ProcedureDefinition<any, infer O>
  ? z.infer<O>
  : never;

export type ClientShape<T extends RouterShape> = {
  [K in keyof T]: (input: InferInput<T[K]>) => Promise<InferOutput<T[K]>>;
};

export type FlatClientShape<T extends RouterShape> = {
  [K in keyof T & string]: (input: InferInput<T[K]>) => Promise<InferOutput<T[K]>>;
};

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ""
    ? []
    : S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S];

type BuildNestedClient<Path extends readonly string[], Fn> = Path extends [
  infer Head extends string,
  ...infer Tail extends string[],
]
  ? Tail["length"] extends 0
    ? { [K in Head]: Fn }
    : { [K in Head]: BuildNestedClient<Tail, Fn> }
  : never;

export type NestedClientShape<T extends RouterShape> = UnionToIntersection<
  {
    [K in keyof T & string]: BuildNestedClient<
      Split<K, ".">,
      (input: InferInput<T[K]>) => Promise<InferOutput<T[K]>>
    >;
  }[keyof T & string]
>;

export type UnapiClient<T extends RouterShape> = NestedClientShape<T> & {
  call<K extends keyof T & string>(
    id: K,
    input: InferInput<T[K]>,
  ): Promise<InferOutput<T[K]>>;
};

export type UnapiClientWithFlat<T extends RouterShape> = UnapiClient<T> &
  FlatClientShape<T>;
