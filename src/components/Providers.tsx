"use client";

import { MidiProvider } from "@/contexts/MidiContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <MidiProvider>{children}</MidiProvider>;
}
