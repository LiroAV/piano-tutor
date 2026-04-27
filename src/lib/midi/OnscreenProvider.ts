import type { NoteEvent, PedalEvent, InputStatus } from "@/types";
import type { PianoInputProvider } from "./types";
import { midiNoteToName, midiNoteToFrequency, generateNoteId } from "./utils";

export class OnscreenProvider implements PianoInputProvider {
  private status: InputStatus = { type: "disconnected" };

  private onNoteStartCb: ((e: NoteEvent) => void) | null = null;
  private onNoteEndCb: ((e: NoteEvent) => void) | null = null;
  private onPedalChangeCb: ((e: PedalEvent) => void) | null = null;

  private activeNoteIds = new Map<number, string>();

  async connect(): Promise<void> {
    this.status = { type: "connected", deviceName: "On-Screen Keyboard" };
  }

  async disconnect(): Promise<void> {
    this.status = { type: "disconnected" };
  }

  triggerNoteStart(noteNumber: number, velocity = 80): void {
    const id = generateNoteId();
    this.activeNoteIds.set(noteNumber, id);

    this.onNoteStartCb?.({
      id,
      source: "onscreen",
      noteNumber,
      noteName: midiNoteToName(noteNumber),
      frequencyHz: midiNoteToFrequency(noteNumber),
      velocity,
      startedAtMs: performance.now(),
      confidence: 1.0,
    });
  }

  triggerNoteEnd(noteNumber: number): void {
    const id = this.activeNoteIds.get(noteNumber) ?? generateNoteId();
    this.activeNoteIds.delete(noteNumber);

    this.onNoteEndCb?.({
      id,
      source: "onscreen",
      noteNumber,
      noteName: midiNoteToName(noteNumber),
      frequencyHz: midiNoteToFrequency(noteNumber),
      velocity: 0,
      startedAtMs: performance.now(),
      endedAtMs: performance.now(),
      confidence: 1.0,
    });
  }

  onNoteStart(callback: (event: NoteEvent) => void): void {
    this.onNoteStartCb = callback;
  }

  onNoteEnd(callback: (event: NoteEvent) => void): void {
    this.onNoteEndCb = callback;
  }

  onPedalChange(callback: (event: PedalEvent) => void): void {
    this.onPedalChangeCb = callback;
  }

  getStatus(): InputStatus {
    return this.status;
  }
}
