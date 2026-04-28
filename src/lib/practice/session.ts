"use client";

import { useEffect, useRef, useState } from "react";
import { useMidi } from "@/contexts/MidiContext";
import type { SequenceExercise, NoteAttempt, ExerciseResult } from "./types";

type SessionPhase = "playing" | "done";

export type SessionState = {
  phase: SessionPhase;
  currentNoteIndex: number;
  attempts: NoteAttempt[];
  currentNoteWrongCount: number;
  lastResult: "correct" | "wrong" | null;
  result: ExerciseResult | null;
};

export function usePracticeSession(exercise: SequenceExercise) {
  const { noteHistory } = useMidi();
  const lastProcessedId = useRef<string | null>(null);
  const startedAtMs = useRef(performance.now());

  const [state, setState] = useState<SessionState>({
    phase: "playing",
    currentNoteIndex: 0,
    attempts: [],
    currentNoteWrongCount: 0,
    lastResult: null,
    result: null,
  });

  useEffect(() => {
    const latestNote = noteHistory[0];
    if (!latestNote || latestNote.id === lastProcessedId.current) return;
    lastProcessedId.current = latestNote.id;

    setState((prev) => {
      if (prev.phase === "done") return prev;

      const expected = exercise.sequence[prev.currentNoteIndex];
      const correct = latestNote.noteNumber === expected;

      if (correct) {
        const attempt: NoteAttempt = {
          expectedNote: expected,
          playedNote: latestNote.noteNumber,
          correct: true,
          wrongAttempts: prev.currentNoteWrongCount,
        };
        const attempts = [...prev.attempts, attempt];
        const nextIndex = prev.currentNoteIndex + 1;

        if (nextIndex >= exercise.sequence.length) {
          const durationMs = performance.now() - startedAtMs.current;
          const correctFirstTry = attempts.filter((a) => a.wrongAttempts === 0).length;
          const totalWrongAttempts = attempts.reduce((sum, a) => sum + a.wrongAttempts, 0);
          return {
            phase: "done",
            currentNoteIndex: nextIndex,
            attempts,
            currentNoteWrongCount: 0,
            lastResult: "correct",
            result: {
              exerciseId: exercise.id,
              attempts,
              correctFirstTry,
              totalWrongAttempts,
              durationMs,
            },
          };
        }

        return {
          ...prev,
          currentNoteIndex: nextIndex,
          attempts,
          currentNoteWrongCount: 0,
          lastResult: "correct",
        };
      } else {
        return {
          ...prev,
          currentNoteWrongCount: prev.currentNoteWrongCount + 1,
          lastResult: "wrong",
        };
      }
    });
  }, [noteHistory, exercise]);

  const reset = () => {
    lastProcessedId.current = null;
    startedAtMs.current = performance.now();
    setState({
      phase: "playing",
      currentNoteIndex: 0,
      attempts: [],
      currentNoteWrongCount: 0,
      lastResult: null,
      result: null,
    });
  };

  return { state, reset };
}
