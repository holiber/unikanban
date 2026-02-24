import type { z } from "zod";
import type { ProcedureDefinition, ProcedureMeta } from "./types.js";

export interface ProcedureConfig<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
> {
  meta: ProcedureMeta;
  input: TInput;
  output: TOutput;
  handler: (input: z.infer<TInput>) => Promise<z.infer<TOutput>> | z.infer<TOutput>;
}

export function defineProcedure<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
>(config: ProcedureConfig<TInput, TOutput>): ProcedureDefinition<TInput, TOutput> {
  return {
    meta: config.meta,
    input: config.input,
    output: config.output,
    handler: config.handler,
  };
}
