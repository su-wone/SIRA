"use client";

import { useEffect, useRef } from "react";

type SSEHandler = (data: unknown) => void;

export function useSSE(handlers: Record<string, SSEHandler>) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource("/api/sse");

      es.addEventListener("connected", () => {
        // Connected
      });

      for (const event of Object.keys(handlersRef.current)) {
        es.addEventListener(event, (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data);
            handlersRef.current[event]?.(data);
          } catch {
            // ignore parse errors
          }
        });
      }

      es.onerror = () => {
        es?.close();
        reconnectTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      es?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);
}
