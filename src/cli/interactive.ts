import type { EventBus } from "../unapi/events.js";
import type { Router, RouterShape } from "../unapi/index.js";
import { createCli } from "./index.js";
import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

export type InteractiveCliOptions<T extends RouterShape> = {
  router: Router<T>;
  call?: (procedureId: string, input: Record<string, any>) => Promise<any>;
  events?: EventBus<any>;
  knownEventNames?: readonly string[];
  input?: Readable;
  output?: Writable;
  prompt?: string;
};

function splitArgs(line: string): string[] {
  const args: string[] = [];
  let cur = "";
  let quote: "'" | '"' | null = null;
  let escape = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;

    if (escape) {
      cur += ch;
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (quote) {
      if (ch === quote) {
        quote = null;
        continue;
      }
      cur += ch;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (cur) {
        args.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }

  if (cur) args.push(cur);
  return args;
}

export async function runInteractiveCli<T extends RouterShape>(
  opts: InteractiveCliOptions<T>,
): Promise<void> {
  const input = opts.input ?? process.stdin;
  const output = opts.output ?? process.stdout;
  const prompt = opts.prompt ?? "unikanban> ";

  const writeOut = (text: string) => output.write(text + "\n");
  const writeErr = (text: string) => output.write(text + "\n");

  const cli = createCli(opts.router, {
    call: opts.call,
    exitProcess: false,
    exitOnError: false,
    writeOut,
    writeErr,
  });

  const knownEventNames = opts.knownEventNames ?? [];
  const subscriptions = new Map<string, () => void>();

  function printHelp() {
    writeOut("Interactive mode:");
    writeOut("  .help                 Show this help");
    writeOut("  .exit                 Exit interactive mode");
    writeOut("  .events list          List known events and subscription status");
    writeOut("  .events on [name]     Subscribe (all or a single event)");
    writeOut("  .events off [name]    Unsubscribe (all or a single event)");
    writeOut("");
    writeOut("Examples:");
    writeOut('  board create --title "My board"');
    writeOut("  board list");
    writeOut("  .events on board:created");
  }

  function listEvents() {
    if (!knownEventNames.length) {
      writeOut("No known events configured for this CLI.");
      return;
    }
    for (const name of knownEventNames) {
      const active = subscriptions.has(name);
      writeOut(`${active ? "[on ]" : "[off]"} ${name}`);
    }
  }

  function subscribe(name?: string) {
    if (!opts.events) {
      writeOut("Events are not available in this mode.");
      return;
    }
    if (!knownEventNames.length) {
      writeOut("No known events configured for this CLI.");
      return;
    }

    const targets = name ? [name] : [...knownEventNames];
    for (const ev of targets) {
      if (subscriptions.has(ev)) continue;
      const unsub = opts.events.on(ev as any, (payload: unknown) => {
        writeOut(`[event ${ev}] ${JSON.stringify(payload)}`);
      });
      subscriptions.set(ev, unsub);
    }
  }

  function unsubscribe(name?: string) {
    if (!knownEventNames.length) {
      writeOut("No known events configured for this CLI.");
      return;
    }
    const targets = name ? [name] : [...subscriptions.keys()];
    for (const ev of targets) {
      const unsub = subscriptions.get(ev);
      if (!unsub) continue;
      unsub();
      subscriptions.delete(ev);
    }
  }

  const rl = createInterface({
    input,
    output,
    prompt,
    terminal: Boolean((output as any).isTTY),
  });

  writeOut("UniKanban CLI interactive mode. Type .help for help.");
  rl.prompt();

  await new Promise<void>((resolve) => {
    let closed = false;
    let queue = Promise.resolve();

    const handleLine = async (line: string) => {
      if (closed) return;
      const trimmed = line.trim();
      if (!trimmed) {
        if (!closed) rl.prompt();
        return;
      }

      if (trimmed === ".exit" || trimmed === "exit" || trimmed === "quit") {
        closed = true;
        rl.close();
        return;
      }

      if (trimmed === ".help" || trimmed === "help") {
        printHelp();
        if (!closed) rl.prompt();
        return;
      }

      if (trimmed.startsWith(".events")) {
        const parts = splitArgs(trimmed);
        const sub = parts[1];
        const name = parts[2];
        if (sub === "list") listEvents();
        else if (sub === "on") subscribe(name);
        else if (sub === "off") unsubscribe(name);
        else writeOut("Usage: .events <list|on|off> [name]");
        if (!closed) rl.prompt();
        return;
      }

      try {
        const argv = splitArgs(trimmed);
        await cli.parseAsync(argv);
      } catch (err: any) {
        writeErr(`Error: ${err?.message ?? String(err)}`);
      } finally {
        if (!closed) rl.prompt();
      }
    };

    rl.on("line", (line) => {
      queue = queue.then(() => handleLine(line));
    });

    rl.on("close", () => {
      closed = true;
      unsubscribe();
      queue.finally(() => resolve());
    });
  });
}

