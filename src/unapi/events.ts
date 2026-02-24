export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus<TEvents extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<string, Set<EventHandler<any>>>();

  on<K extends string & keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  once<K extends string & keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[K]>,
  ): () => void {
    const wrapper: EventHandler<TEvents[K]> = (payload) => {
      unsub();
      handler(payload);
    };
    const unsub = this.on(event, wrapper);
    return unsub;
  }

  emit<K extends string & keyof TEvents>(event: K, payload: TEvents[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(payload);
      }
    }
  }

  off<K extends string & keyof TEvents>(event: K): void {
    this.listeners.delete(event);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  listenerCount<K extends string & keyof TEvents>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
