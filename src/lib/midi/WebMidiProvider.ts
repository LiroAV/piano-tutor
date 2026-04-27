import type { NoteEvent, PedalEvent, InputStatus, MidiDevice } from "@/types";
import type { PianoInputProvider } from "./types";
import { midiNoteToName, midiNoteToFrequency, generateNoteId } from "./utils";

export class WebMidiProvider implements PianoInputProvider {
  private midiAccess: MIDIAccess | null = null;
  private activeInput: MIDIInput | null = null;
  private status: InputStatus = { type: "disconnected" };

  private onNoteStartCb: ((e: NoteEvent) => void) | null = null;
  private onNoteEndCb: ((e: NoteEvent) => void) | null = null;
  private onPedalChangeCb: ((e: PedalEvent) => void) | null = null;
  private onDeviceChangeCb: (() => void) | null = null;

  private activeNoteIds = new Map<number, string>();

  async connect(): Promise<void> {
    if (!navigator.requestMIDIAccess) {
      this.status = { type: "error", message: "Web MIDI not supported. Use Chrome or Edge." };
      throw new Error((this.status as { message: string }).message);
    }

    this.status = { type: "connecting" };

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.status = { type: "connected" };

      this.midiAccess.onstatechange = () => {
        this.onDeviceChangeCb?.();
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "MIDI access denied";
      this.status = { type: "error", message };
      throw err;
    }
  }

  async connectDevice(deviceId: string): Promise<void> {
    if (!this.midiAccess) throw new Error("Call connect() first");

    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) throw new Error(`Device ${deviceId} not found`);

    if (this.activeInput) {
      this.activeInput.onmidimessage = null;
    }

    this.activeInput = input;
    this.activeInput.onmidimessage = this.handleMessage.bind(this);
    this.status = { type: "connected", deviceName: input.name ?? undefined };
  }

  private handleMessage(event: MIDIMessageEvent): void {
    const data = event.data;
    if (!data || data.length < 2) return;

    const statusByte = data[0];
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;
    const type = statusByte & 0xf0;

    if (type === 0x90 && velocity > 0) {
      const id = generateNoteId();
      this.activeNoteIds.set(note, id);

      this.onNoteStartCb?.({
        id,
        source: "midi",
        noteNumber: note,
        noteName: midiNoteToName(note),
        frequencyHz: midiNoteToFrequency(note),
        velocity,
        startedAtMs: performance.now(),
        confidence: 1.0,
      });
    } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
      const id = this.activeNoteIds.get(note) ?? generateNoteId();
      this.activeNoteIds.delete(note);

      this.onNoteEndCb?.({
        id,
        source: "midi",
        noteNumber: note,
        noteName: midiNoteToName(note),
        frequencyHz: midiNoteToFrequency(note),
        velocity: 0,
        startedAtMs: performance.now(),
        endedAtMs: performance.now(),
        confidence: 1.0,
      });
    } else if (type === 0xb0 && note === 64) {
      // Sustain pedal (CC #64)
      this.onPedalChangeCb?.({
        pedal: "sustain",
        active: velocity >= 64,
        timestamp: performance.now(),
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.activeInput) {
      this.activeInput.onmidimessage = null;
      this.activeInput = null;
    }
    this.status = { type: "disconnected" };
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

  onDeviceChange(callback: () => void): void {
    this.onDeviceChangeCb = callback;
  }

  getStatus(): InputStatus {
    return this.status;
  }

  getAvailableDevices(): MidiDevice[] {
    if (!this.midiAccess) return [];
    const devices: MidiDevice[] = [];
    this.midiAccess.inputs.forEach((input) => {
      devices.push({
        id: input.id,
        name: input.name ?? "Unknown Device",
        manufacturer: input.manufacturer ?? "",
        state: input.state as "connected" | "disconnected",
      });
    });
    return devices;
  }
}
