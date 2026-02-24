import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { Router, RouterShape } from "../unapi/index.js";
import { extractFields } from "../unapi/schema-utils.js";

export function createCli<T extends RouterShape>(
  router: Router<T>,
  options?: { scriptName?: string; version?: string },
) {
  const desc = router.describe();
  let cli = yargs(hideBin(process.argv))
    .scriptName(options?.scriptName ?? "unikanban")
    .version(options?.version ?? "0.1.0")
    .help();

  for (const proc of desc.procedures) {
    const procedure = router.procedures[proc.id as keyof T];
    const fields = extractFields(procedure.input);

    cli = cli.command(
      renderCliCommand(proc.id),
      proc.meta.description,
      (yarg) => {
        let builder = yarg;
        for (const field of fields) {
          const opts: Record<string, any> = {
            describe: field.enumValues
              ? `${field.name} (${field.enumValues.join(" | ")})`
              : field.name,
            demandOption: field.required,
            type: mapFieldType(field.type),
          };
          if (field.enumValues) {
            opts.choices = field.enumValues;
          }
          builder = builder.option(field.name, opts);
        }
        return builder;
      },
      async (argv) => {
        const input: Record<string, any> = {};
        for (const field of fields) {
          if (argv[field.name] !== undefined) {
            input[field.name] = argv[field.name];
          }
        }
        try {
          const result = await router.call(proc.id, input);
          console.log(JSON.stringify(result, null, 2));
        } catch (err: any) {
          console.error(`Error: ${err.message}`);
          process.exit(1);
        }
      },
    );
  }

  cli = cli.demandCommand(1, "Please specify a command").strict();

  return cli;
}

function mapFieldType(type: string): "string" | "number" | "boolean" | "array" {
  switch (type) {
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    default:
      return "string";
  }
}

function renderCliCommand(id: string): string {
  // Recommended rendering: `board.create` -> `board create`
  return id.split(".").join(" ");
}
