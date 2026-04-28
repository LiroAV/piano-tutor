import type { NoteEvent, PedalEvent, InputStatus } from "@/types";
import type { PianoInputProvider } from "./types";
import { midiNoteToName, midiNoteToFrequency, generateNoteId } from "./utils";

// Autocorrelation-based pitch detection.
// Buffer: 4096 samples from AnalyserNode (44100 or 48000 Hz).
// Correlation window: first WINDOW samples correlated against lags up to maxLag.
// Covers ~F2 (86 Hz) and above — sufficient for all practice exercises.
function detectPitch(buffer: Float32Array, sampleRate: number): number {
  const WINDOW = 512;
  const minLag = Math.floor(sampleRate / 4200); // C8
  const maxLag = Math.min(WINDOW - 1, Math.floor(sampleRate / 80)); // ~E2

  let bestR = 0;
  let bestLag = -1;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let r = 0;
    for (let i = 0; i < WINDOW; i++) {
      r += buffer[i] * buffer[i + lag];
    }
    if (r > bestR) {
      bestR = r;
      bestLag = lag;
    }
  }

  if (bestLag === -1 || bestR < 0.0005) return -1;

  // Parabolic interpolation for sub-sample accuracy
  if (bestLag > minLag && bestLag < maxLag) {
    let rPrev = 0, rNext = 0;
    for (let i = 0; i < WINDOW; i++) {
      rPrev += buffer[i] * buffer[i + bestLag - 1];
      rNext += buffer[i] * buffer[i + bestLag + 1];
    }
    const denom = 2 * bestR - rPrev - rNext;
    if (denom !== 0) {
      const shift = (rNext - rPrev) / (2 * denom);
      if (Math.abs(shift) < 1) return sampleRate / (bestLag + shift);
    }
  }

  return sampleRate / bestLag;
}

function getRms(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

export class MicrophoneProvider implements PianoInputProvider {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private status: InputStatus = { type: "disconnected" };

  private onNoteStartCb: ((e: NoteEvent) => void) | null = null;
  private onNoteEndCb: ((e: NoteEvent) => void) | null = null;
  private onPedalChangeCb: ((e: PedalEvent) => void) | null = null;

  private activeNote: number | null = null;
  private activeNoteId: string | null = null;
  private candidateNote: number | null = null;
  private candidateCount = 0;
  private silentCount = 0;

  // Thresholds
  private readonly STABLE_FRAMES = 2;   // consecutive frames to confirm note-on
  private readonly SILENT_FRAMES = 8;   // silence frames before note-off
  private readonly RMS_ON = 0.018;      // audible threshold
  private readonly RMS_OFF = 0.007;     // silence threshold

  // Exposed for UI noise meter
  currentRms = 0;

  async connect(): Promise<void> {
    this.status = { type: "connecting" };

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    this.audioContext = new AudioContext();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0;
    this.source.connect(this.analyser);

    const buf = new Float32Array(4096);

    this.pollInterval = setInterval(() => {
      if (!this.analyser || !this.audioContext) return;
      this.analyser.getFloatTimeDomainData(buf);
      this.processFrame(buf, this.audioContext.sampleRate);
    }, 50);

    this.status = { type: "connected", deviceName: "Microphone" };
  }

  private processFrame(buffer: Float32Array, sampleRate: number): void {
    const rms = getRms(buffer);
    this.currentRms = rms;

    if (rms < this.RMS_OFF) {
      this.silentCount++;
      this.candidateNote = null;
      this.candidateCount = 0;

      if (this.silentCount >= this.SILENT_FRAMES && this.activeNote !== null) {
        this.emitNoteOff(this.activeNote);
        this.activeNote = null;
        this.activeNoteId = null;
      }
      return;
    }

    this.silentCount = 0;
    if (rms < this.RMS_ON) return;

    const freq = detectPitch(buffer, sampleRate);
    if (freq <= 0) return;

    const midi = Math.round(12 * Math.log2(freq / 440) + 69);
    if (midi < 36 || midi > 108) return; // C2–C8 practical range

    if (midi === this.candidateNote) {
      this.candidateCount++;
      if (this.candidateCount >= this.STABLE_FRAMES && midi !== this.activeNote) {
        if (this.activeNote !== null) this.emitNoteOff(this.activeNote);
        this.activeNoteId = generateNoteId();
        this.activeNote = midi;
        const velocity = Math.min(127, Math.round(rms * 800));
        this.emitNoteOn(midi, velocity, this.activeNoteId);
      }
    } else {
      this.candidateNote = midi;
      this.candidateCount = 1;
    }
  }

  private emitNoteOn(noteNumber: number, velocity: number, id: string): void {
    this.onNoteStartCb?.({
      id,
      source: "microphone",
      noteNumber,
      noteName: midiNoteToName(noteNumber),
      frequencyHz: midiNoteToFrequency(noteNumber),
      velocity,
      startedAtMs: performance.now(),
      confidence: 0.8,
    });
  }

  private emitNoteOff(noteNumber: number): void {
    this.onNoteEndCb?.({
      id: this.activeNoteId ?? generateNoteId(),
      source: "microphone",
      noteNumber,
      noteName: midiNoteToName(noteNumber),
      frequencyHz: midiNoteToFrequency(noteNumber),
      velocity: 0,
      startedAtMs: performance.now(),
      endedAtMs: performance.now(),
      confidence: 0.8,
    });
  }

  async disconnect(): Promise<void> {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.source?.disconnect();
    this.source = null;
    this.analyser?.disconnect();
    this.analyser = null;
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.activeNote = null;
    this.activeNoteId = null;
    this.candidateNote = null;
    this.candidateCount = 0;
    this.silentCount = 0;
    this.currentRms = 0;
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
  getStatus(): InputStatus {
    return this.status;
  }
}
