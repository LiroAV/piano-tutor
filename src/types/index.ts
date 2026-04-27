export type NoteEvent = {
  id: string;
  source: "midi" | "microphone" | "onscreen";
  noteNumber: number;
  noteName: string;
  frequencyHz: number;
  velocity: number;
  startedAtMs: number;
  endedAtMs?: number;
  durationMs?: number;
  confidence: number;
  hand?: "left" | "right" | "unknown";
};

export type PedalEvent = {
  pedal: "sustain" | "soft" | "sostenuto";
  active: boolean;
  timestamp: number;
};

export type InputStatus =
  | { type: "disconnected" }
  | { type: "connecting" }
  | { type: "connected"; deviceName?: string; latencyMs?: number }
  | { type: "error"; message: string };

export type MidiDevice = {
  id: string;
  name: string;
  manufacturer: string;
  state: "connected" | "disconnected";
};

export type User = {
  id: string;
  name: string;
  createdAt: string;
  timezone: string;
  preferredLanguage: string;
  level: "absolute_beginner" | "beginner" | "intermediate" | "advanced";
  dailyPracticeMinutes: number;
  goals: string[];
  tutorStyle: "gentle" | "strict" | "funny" | "analytical" | "motivating";
};
