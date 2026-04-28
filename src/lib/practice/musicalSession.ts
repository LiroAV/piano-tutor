"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMidi } from "@/contexts/MidiContext";
import type { MusicNote, MusicalExercise, ExerciseResult } from "./types";

// A "step" = all notes that start on the same beat.
// The player must press every note in the step (in any order, rolling is fine).
export type MusicalStep = {
  beat: number;
  notes: MusicNote[];
};

export type MusicalSessionState = {
  phase: "playing" | "done";
  stepIndex: number;
  totalSteps: number;
  lastResult: "correct" | "wrong" | null;
  wrongCount: number;
  result: ExerciseResult | null;
};

export function buildSteps(notes: MusicNote[]): MusicalStep[] {
  const map = new Map<number, MusicNote[]>();
  for (const note of notes) {
    // Round to 3 decimal places to avoid floating-point grouping mismatches
    const key = Math.round(note.beat * 1000);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(note);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, stepNotes]) => ({ beat: stepNotes[0].beat, notes: stepNotes }));
}

export function useMusicalSession(exercise: MusicalExercise) {
  const { activeNotes, noteHistory } = useMidi();
  const steps = useMemo(() => buildSteps(exercise.notes), [exercise.notes]);

  const startedAt = useRef(performance.now());
  const advancingRef = useRef(false);
  const pressedRef = useRef(new Set<number>());
  const wrongCountRef = useRef(0);
  const lastNoteIdRef = useRef<string | null>(null);

  const [state, setState] = useState<MusicalSessionState>({
    phase: "playing",
    stepIndex: 0,
    totalSteps: steps.length,
    lastResult: null,
    wrongCount: 0,
    result: null,
  });

  // Detect when all notes in the current step have been pressed
  useEffect(() => {
    if (state.phase !== "playing" || advancingRef.current) return;
    const currentStep = steps[state.stepIndex];
    if (!currentStep) return;

    const required = currentStep.notes.map((n) => n.midi);

    // Accumulate any required notes that are currently held
    for (const midi of activeNotes.keys()) {
      if (required.includes(midi)) pressedRef.current.add(midi);
    }

    if (!required.every((m) => pressedRef.current.has(m))) return;

    // All required notes pressed — advance to the next step
    advancingRef.current = true;
    pressedRef.current = new Set();

    const nextIndex = state.stepIndex + 1;

    if (nextIndex >= steps.length) {
      setState((prev) => ({
        ...prev,
        phase: "done",
        stepIndex: nextIndex,
        lastResult: "correct",
        result: {
          exerciseId: exercise.id,
          attempts: [],
          correctFirstTry: steps.length - wrongCountRef.current,
          totalWrongAttempts: wrongCountRef.current,
          durationMs: performance.now() - startedAt.current,
        },
      }));
      advancingRef.current = false;
    } else {
      setState((prev) => ({ ...prev, stepIndex: nextIndex, lastResult: "correct" }));
      setTimeout(() => {
        advancingRef.current = false;
        setState((prev) => (prev.lastResult === "correct" ? { ...prev, lastResult: null } : prev));
      }, 200);
    }
  }, [activeNotes, state.phase, state.stepIndex, steps, exercise.id]);

  // Detect wrong-note presses (a note that isn't in the current step)
  useEffect(() => {
    const latest = noteHistory[0];
    if (!latest || latest.id === lastNoteIdRef.current) return;
    lastNoteIdRef.current = latest.id;

    if (state.phase !== "playing" || advancingRef.current) return;
    const currentStep = steps[state.stepIndex];
    if (!currentStep) return;

    const required = currentStep.notes.map((n) => n.midi);
    if (!required.includes(latest.noteNumber)) {
      wrongCountRef.current++;
      setState((prev) => ({ ...prev, lastResult: "wrong", wrongCount: prev.wrongCount + 1 }));
      setTimeout(() => {
        setState((prev) => (prev.lastResult === "wrong" ? { ...prev, lastResult: null } : prev));
      }, 400);
    }
  }, [noteHistory, state.phase, state.stepIndex, steps]);

  const reset = () => {
    pressedRef.current = new Set();
    advancingRef.current = false;
    wrongCountRef.current = 0;
    startedAt.current = performance.now();
    setState({
      phase: "playing",
      stepIndex: 0,
      totalSteps: steps.length,
      lastResult: null,
      wrongCount: 0,
      result: null,
    });
  };

  return { state, steps, reset };
}
