import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { Router, RouterShape } from "../unapi/index.js";
import { extractFields } from "../unapi/schema-utils.js";

type ProcDesc = ReturnType<Router<any>["describe"]>["procedures"][number];

type TrieNode = {
  children: Map<string, TrieNode>;
  proc?: ProcDesc;
};

export function createCli<T extends RouterShape>(
  router: Router<T>,
  options?: {
    scriptName?: string;
    version?: string;
    call?: (procedureId: string, input: Record<string, any>) => Promise<any>;
  },
) {
  const desc = router.describe();
  let cli = yargs(hideBin(process.argv))
    .scriptName(options?.scriptName ?? "unikanban")
    .version(options?.version ?? "0.1.0")
    .help();

  const root = buildTrie(desc.procedures);
  for (const [seg, node] of root.children) {
    cli = registerNode(cli, router, seg, node, options?.call) as any;
  }

  cli = cli.demandCommand(1, "Please specify a command").strict();

  return cli;
}

function buildTrie(procedures: ProcDesc[]): TrieNode {
  const root: TrieNode = { children: new Map() };
  for (const proc of procedures) {
    const segments = proc.id.split(".").filter(Boolean);
    let node = root;
    if (segments.length === 0) continue;

    for (const seg of segments) {
      let child = node.children.get(seg);
      if (!child) {
        child = { children: new Map() };
        node.children.set(seg, child);
      }
      node = child;
    }
    node.proc = proc;
  }
  return root;
}

function registerNode<T extends RouterShape>(
  y: any,
  router: Router<T>,
  segment: string,
  node: TrieNode,
  callOverride?: (procedureId: string, input: Record<string, any>) => Promise<any>,
): any {
  const hasChildren = node.children.size > 0;
  const isLeaf = Boolean(node.proc);

  if (isLeaf && !hasChildren) {
    return registerLeaf(y, router, segment, node.proc!, callOverride);
  }

  // Group / namespace node (supports `board create`, `admin user create`, etc.)
  return y.command(
    `${segment} <command>`,
    `Commands under ${segment}`,
    (yy: any) => {
      for (const [childSeg, childNode] of node.children) {
        registerNode(yy, router, childSeg, childNode, callOverride);
      }

      if (isLeaf) {
        // If a procedure ends at this node, expose it as `segment call`.
        registerLeaf(yy, router, "call", node.proc!, callOverride);
      }

      return yy.demandCommand(1, "Please specify a command").strict();
    },
    () => {},
  );
}

function registerLeaf<T extends RouterShape>(
  y: any,
  router: Router<T>,
  command: string,
  proc: ProcDesc,
  callOverride?: (procedureId: string, input: Record<string, any>) => Promise<any>,
): any {
  const procedure = router.procedures[proc.id as keyof T];
  const fields = extractFields(procedure.input);
  const call =
    callOverride ??
    ((procedureId: string, input: Record<string, any>) =>
      router.call(procedureId as any, input as any));

  return y.command(
    command,
    proc.meta.description,
    (yarg: any) => {
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
    async (argv: any) => {
      const input: Record<string, any> = {};
      for (const field of fields) {
        if (argv[field.name] !== undefined) {
          input[field.name] = argv[field.name];
        }
      }
      try {
        const result = await call(proc.id, input);
        console.log(JSON.stringify(result, null, 2));
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    },
  );
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
