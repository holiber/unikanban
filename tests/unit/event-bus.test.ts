import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../../src/unapi/events.js";

type TestEvents = {
  ping: { ts: number };
  pong: string;
};

describe("EventBus", () => {
  it("emits events to registered listeners", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.on("ping", handler);
    bus.emit("ping", { ts: 123 });

    expect(handler).toHaveBeenCalledWith({ ts: 123 });
  });

  it("supports multiple listeners for the same event", () => {
    const bus = new EventBus<TestEvents>();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on("ping", h1);
    bus.on("ping", h2);
    bus.emit("ping", { ts: 1 });

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it("unsubscribes via returned function", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    const unsub = bus.on("ping", handler);
    bus.emit("ping", { ts: 1 });
    expect(handler).toHaveBeenCalledOnce();

    unsub();
    bus.emit("ping", { ts: 2 });
    expect(handler).toHaveBeenCalledOnce();
  });

  it("once fires handler only once", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.once("pong", handler);
    bus.emit("pong", "first");
    bus.emit("pong", "second");

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith("first");
  });

  it("off removes all listeners for an event", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.on("ping", handler);
    bus.off("ping");
    bus.emit("ping", { ts: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it("removeAllListeners clears everything", () => {
    const bus = new EventBus<TestEvents>();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on("ping", h1);
    bus.on("pong", h2);
    bus.removeAllListeners();

    bus.emit("ping", { ts: 1 });
    bus.emit("pong", "x");

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it("reports listener count", () => {
    const bus = new EventBus<TestEvents>();
    expect(bus.listenerCount("ping")).toBe(0);

    bus.on("ping", () => {});
    bus.on("ping", () => {});
    expect(bus.listenerCount("ping")).toBe(2);
  });

  it("does nothing when emitting to an event with no listeners", () => {
    const bus = new EventBus<TestEvents>();
    expect(() => bus.emit("ping", { ts: 1 })).not.toThrow();
  });
});
