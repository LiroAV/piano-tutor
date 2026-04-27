import type { NoteEvent, PedalEvent, InputStatus } from "@/types";

export interface PianoInputProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onNoteStart(callback: (event: NoteEvent) => void): void;
  onNoteEnd(callback: (event: NoteEvent) => void): void;
  onPedalChange(callback: (event: PedalEvent) => void): void;
  getStatus(): InputStatus;
}
