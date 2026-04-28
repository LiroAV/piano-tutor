import type { Exercise } from "./types";
import { MUSICAL_PIECES } from "./pieces";

const SEQUENCE_EXERCISES: Exercise[] = [
  {
    id: "middle-c",
    title: "Find Middle C",
    description: "Play C4 — the C near the center of your piano, just left of the group of two black keys.",
    level: "absolute_beginner",
    sequence: [60],
  },
  {
    id: "cde",
    title: "C–D–E Pattern",
    description: "Play C, D, then E one at a time with fingers 1, 2, 3.",
    level: "absolute_beginner",
    sequence: [60, 62, 64],
  },
  {
    id: "five-finger-c-up",
    title: "Five-Finger Pattern: C Major (ascending)",
    description: "Play C–D–E–F–G with fingers 1–5, going up.",
    level: "absolute_beginner",
    sequence: [60, 62, 64, 65, 67],
  },
  {
    id: "five-finger-c-down",
    title: "Five-Finger Pattern: C Major (descending)",
    description: "Play G–F–E–D–C with fingers 5–1, going down.",
    level: "absolute_beginner",
    sequence: [67, 65, 64, 62, 60],
  },
  {
    id: "five-finger-c-updown",
    title: "Five-Finger Pattern: C Major (up and back)",
    description: "Play C–D–E–F–G–F–E–D–C. A complete five-finger warm-up.",
    level: "absolute_beginner",
    sequence: [60, 62, 64, 65, 67, 65, 64, 62, 60],
  },
  {
    id: "ode-to-joy-1",
    title: "Ode to Joy — Opening Phrase",
    description: "The first phrase of Beethoven's Ode to Joy. All notes lie within the five-finger position.",
    level: "beginner",
    sequence: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62],
  },
  {
    id: "hot-cross-buns",
    title: "Hot Cross Buns",
    description: "A classic beginner melody using only E, D, and C.",
    level: "beginner",
    sequence: [64, 62, 60, 64, 62, 60, 60, 60, 60, 60, 62, 62, 62, 62, 64, 62, 60],
  },
  {
    id: "mary-had-a-little-lamb",
    title: "Mary Had a Little Lamb",
    description: "First phrase of the traditional nursery rhyme. Uses E, D, C, and G.",
    level: "beginner",
    sequence: [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67],
  },
  {
    id: "twinkle-twinkle",
    title: "Twinkle Twinkle Little Star",
    description: "The classic melody — a great way to cross the full five-finger position.",
    level: "beginner",
    sequence: [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60],
  },
  {
    id: "beethoven-5th",
    title: "Beethoven's 5th — Opening Motif",
    description: "The most famous four notes in music history. G–G–G–Eb, then F–F–F–D.",
    level: "beginner",
    sequence: [67, 67, 67, 63, 65, 65, 65, 62],
  },
  {
    id: "happy-birthday",
    title: "Happy Birthday",
    description: "The world's most sung song. Two phrases in C major.",
    level: "beginner",
    sequence: [60, 60, 62, 60, 65, 64, 60, 60, 62, 60, 67, 65],
  },
  {
    id: "c-major-scale-up",
    title: "C Major Scale — Ascending",
    description: "Play C–D–E–F–G–A–B–C one octave up. Focus on even timing between all 8 notes.",
    level: "intermediate",
    sequence: [60, 62, 64, 65, 67, 69, 71, 72],
  },
  {
    id: "c-major-scale-down",
    title: "C Major Scale — Descending",
    description: "Play C–B–A–G–F–E–D–C, coming back down one octave.",
    level: "intermediate",
    sequence: [72, 71, 69, 67, 65, 64, 62, 60],
  },
  {
    id: "g-major-five-finger",
    title: "Five-Finger Pattern: G Major",
    description: "Play G–A–B–C–D then back down: D–C–B–A–G. Shifts position away from middle C.",
    level: "intermediate",
    sequence: [55, 57, 59, 60, 62, 60, 59, 57, 55],
  },
  {
    id: "ode-to-joy-2",
    title: "Ode to Joy — Second Phrase",
    description: "The second phrase of Beethoven's Ode to Joy, which ends differently from the first.",
    level: "intermediate",
    sequence: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60],
  },
];

export const EXERCISES: Exercise[] = [
  ...SEQUENCE_EXERCISES,
  ...MUSICAL_PIECES,
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
