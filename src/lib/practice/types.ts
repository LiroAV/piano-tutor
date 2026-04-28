export type ExerciseLevel = "absolute_beginner" | "beginner" | "intermediate" | "advanced";

// ── Simple sequence exercise ──────────────────────────────────────────────────
// A flat list of MIDI notes played one at a time; no timing or hand info.
export type SequenceExercise = {
  kind?: undefined;
  id: string;
  title: string;
  description: string;
  level: ExerciseLevel;
  sequence: number[];
};

// ── Musical exercise ──────────────────────────────────────────────────────────
// Full score representation: both hands, note durations, tempo.
export type MusicNote = {
  beat: number;       // start position in quarter-note beats (0-indexed)
  duration: number;   // length in quarter-note beats (0.5 = eighth, 1 = quarter, 2 = half …)
  midi: number;       // MIDI pitch (middle C = 60)
  hand: "left" | "right";
};

export type MusicalExercise = {
  kind: "musical";
  id: string;
  title: string;
  description: string;
  level: ExerciseLevel;
  tempo: number;                   // BPM (quarter notes per minute)
  timeSignature: [number, number]; // [beats per bar, note value]
  totalBeats: number;              // total duration — used for progress display
  notes: MusicNote[];
};

export type Exercise = SequenceExercise | MusicalExercise;

// ── Result types (shared) ─────────────────────────────────────────────────────
export type NoteAttempt = {
  expectedNote: number;
  playedNote: number;
  correct: boolean;
  wrongAttempts: number;
};

export type ExerciseResult = {
  exerciseId: string;
  attempts: NoteAttempt[];
  correctFirstTry: number;
  totalWrongAttempts: number;
  durationMs: number;
};
