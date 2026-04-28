"use client";

import Link from "next/link";
import { useProgress } from "@/lib/practice/progress";
import { EXERCISES } from "@/lib/practice/exercises";

export default function ProgressPage() {
  const { store, ready } = useProgress();

  const masteredCount = ready
    ? Object.values(store.records).filter((r) => r.bestAccuracy >= 80).length
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Progress</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {ready
              ? `${masteredCount} of ${EXERCISES.length} exercises mastered`
              : "Loading…"}
          </p>
        </div>
        {ready && store.streak > 0 && (
          <div className="rounded-full border border-amber-800 bg-amber-950/30 px-3 py-1.5 text-center">
            <p className="text-lg font-bold text-amber-400 leading-none">
              {store.streak}
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">day streak</p>
          </div>
        )}
      </div>

      {/* Overall bar */}
      {ready && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-zinc-500">Overall mastery</p>
            <p className="text-xs text-zinc-400">
              {Math.round((masteredCount / EXERCISES.length) * 100)}%
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${(masteredCount / EXERCISES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Exercise list */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Exercises
        </h2>
        <ul className="space-y-2">
          {EXERCISES.map((ex) => {
            const record = ready ? store.records[ex.id] : undefined;
            const mastered = record && record.bestAccuracy >= 80;
            const started = !!record;

            return (
              <li key={ex.id}>
                <Link
                  href={`/lessons/${ex.id}`}
                  className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Status dot */}
                  <div
                    className={[
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      mastered
                        ? "bg-emerald-400"
                        : started
                          ? "bg-indigo-400"
                          : "bg-zinc-700",
                    ].join(" ")}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {ex.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {started
                        ? `Best: ${record.bestAccuracy}% · ${record.attempts} attempt${record.attempts !== 1 ? "s" : ""}`
                        : "Not started yet"}
                    </p>
                  </div>

                  {/* Accuracy bar */}
                  {started && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={[
                            "h-full rounded-full transition-all",
                            mastered ? "bg-emerald-500" : "bg-indigo-500",
                          ].join(" ")}
                          style={{ width: `${record.bestAccuracy}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-8 text-right tabular-nums">
                        {record.bestAccuracy}%
                      </span>
                    </div>
                  )}

                  {mastered && (
                    <span className="text-xs font-medium text-emerald-400 shrink-0">
                      ✓
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
