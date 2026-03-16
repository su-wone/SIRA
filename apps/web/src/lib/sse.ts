// Server-side SSE event bus
type Listener = (event: string, data: string) => void;

const listeners = new Set<Listener>();

export function addSSEListener(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcastSSE(event: string, data: unknown): void {
  const json = JSON.stringify(data);
  for (const listener of listeners) {
    listener(event, json);
  }
}
