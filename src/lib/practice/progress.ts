"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExerciseResult } from "./types";

export type ExerciseRecord = {
  exerciseId: string;
  bestAccuracy: number;
  attempts: number;
  lastCompletedAt: string;
};

type ProgressStore = {
  records: Record<string, ExerciseRecord>;
  streak: number;
  lastPracticeDate: string | null;
};

const EMPTY: ProgressStore = {
  records: {},
  streak: 0,
  lastPracticeDate: null,
};

const KEY = "piano_tutor_progress";

function load(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist(store: ProgressStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(load());
    setReady(true);
  }, []);

  const saveResult = useCallback(
    (result: ExerciseResult, totalNotes: number) => {
      setStore((prev) => {
        const accuracy = Math.round(
          (result.correctFirstTry / totalNotes) * 100
        );
        const existing = prev.records[result.exerciseId];
        const today = new Date().toDateString();

        let streak = prev.streak;
        if (prev.lastPracticeDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (prev.lastPracticeDate === yesterday.toDateString()) {
            streak = streak + 1;
          } else {
            streak = 1;
          }
        }

        const record: ExerciseRecord = {
          exerciseId: result.exerciseId,
          bestAccuracy: Math.max(accuracy, existing?.bestAccuracy ?? 0),
          attempts: (existing?.attempts ?? 0) + 1,
          lastCompletedAt: new Date().toISOString(),
        };

        const next: ProgressStore = {
          records: { ...prev.records, [result.exerciseId]: record },
          streak,
          lastPracticeDate: today,
        };

        persist(next);
        return next;
      });
    },
    []
  );

  return { store, ready, saveResult };
}
