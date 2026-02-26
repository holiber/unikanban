import { describe, it, expect } from "vitest";
import { PassThrough } from "node:stream";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { runInteractiveCli } from "../../src/cli/interactive.js";
import { KANBAN_EVENT_NAMES } from "../../src/domain/store.js";

describe("interactive CLI", () => {
  it("runs multiple commands and can subscribe to events", async () => {
    resetIdCounter(1);
    const { router, store } = createKanbanApi();

    const input = new PassThrough();
    const output = new PassThrough();

    let out = "";
    output.on("data", (b) => {
      out += b.toString();
    });

    const run = runInteractiveCli({
      router,
      events: store.events,
      knownEventNames: KANBAN_EVENT_NAMES,
      input,
      output,
      prompt: "",
    });

    input.write(".events on board:created\n");
    input.write('board create --title "Artifacts board"\n');
    input.write("board list\n");
    input.write(".exit\n");
    input.end();

    await run;

    expect(out).toMatch(/\[event board:created\]/);
    expect(out).toMatch(/"title":\s*"Artifacts board"/);
  });
});

