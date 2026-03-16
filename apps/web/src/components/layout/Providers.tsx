"use client";

import { CommandPalette } from "./CommandPalette";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
