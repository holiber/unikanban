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
  name: string;
  description: string;
  tags: string[];
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
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
