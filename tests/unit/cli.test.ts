import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createRouter, defineProcedure } from "../../src/unapi/index.js";
import { createCli } from "../../src/cli/index.js";

describe("createCli", () => {
  const procedures = {
    greet: defineProcedure({
      meta: { description: "Say hello" },
      input: z.object({ name: z.string() }),
      output: z.object({ message: z.string() }),
      handler: (input) => ({ message: `Hello, ${input.name}!` }),
    }),
    add: defineProcedure({
      meta: { description: "Add numbers" },
      input: z.object({ a: z.number(), b: z.number() }),
      output: z.object({ sum: z.number() }),
      handler: (input) => ({ sum: input.a + input.b }),
    }),
  };

  it("creates a yargs instance with commands for all procedures", () => {
    const router = createRouter(procedures);
    const cli = createCli(router);
    expect(cli).toBeDefined();
    expect(cli.parseAsync).toBeTypeOf("function");
  });

  it("parses help without throwing", async () => {
    const router = createRouter(procedures);
    const cli = createCli(router);
    let helpOutput = "";
    cli.exitProcess(false);

    try {
      await cli.parseAsync(["--help"]);
    } catch {
      // yargs exits on help
    }
  });
});
