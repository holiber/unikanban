import { describe, it, expect } from "vitest";
import { hello } from "../../src/index.js";

describe("hello", () => {
  it("returns a greeting", () => {
    expect(hello()).toBe("Hello from UniKanban!");
  });
});
