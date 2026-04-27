const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK_NOTE_CLASSES = new Set([1, 3, 6, 8, 10]);

export function midiNoteToName(noteNumber: number): string {
  const octave = Math.floor(noteNumber / 12) - 1;
  return `${NOTE_NAMES[noteNumber % 12]}${octave}`;
}

export function midiNoteToFrequency(noteNumber: number): number {
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

export function isBlackKey(noteNumber: number): boolean {
  return BLACK_NOTE_CLASSES.has(noteNumber % 12);
}

export function isWhiteKey(noteNumber: number): boolean {
  return !isBlackKey(noteNumber);
}

export function generateNoteId(): string {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function noteOctave(noteNumber: number): number {
  return Math.floor(noteNumber / 12) - 1;
}
