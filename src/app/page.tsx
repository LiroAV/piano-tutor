"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMidi } from "@/contexts/MidiContext";
import { useProgress } from "@/lib/practice/progress";
import { useProfile } from "@/lib/user/profile";
import { EXERCISES } from "@/lib/practice/exercises";

type DailyPlan = {
  greeting: string;
  focus: string;
  exercises: { id: string; title: string; reason: string }[];
  tip: string;
};

export default function HomePage() {
  const { status, activeProviderType } = useMidi();
  const { store, ready: progressReady } = useProgress();
  const { profile, ready: profileReady } = useProfile();

  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const fetchedRef = useRef(false);

  const isConnected = status.type === "connected" && activeProviderType !== null;
  const deviceName =
    status.type === "connected" && status.deviceName ? status.deviceName : null;

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const nextExercise = progressReady
    ? EXERCISES.find((ex) => {
        const r = store.records[ex.id];
        return !r || r.bestAccuracy < 90;
      })
    : null;

  const masteredCount = progressReady
    ? Object.values(store.records).filter((r) => r.bestAccuracy >= 90).length
    : 0;

  useEffect(() => {
    if (!profileReady || !progressReady || !profile || fetchedRef.current) return;
    fetchedRef.current = true;
    setPlanLoading(true);

    fetch("/api/tutor/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        progress: Object.values(store.records),
      }),
    })
      .then((r) => r.json())
      .then((data: DailyPlan) => setPlan(data))
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [profileReady, progressReady, profile, store.records]);

  // Show onboarding prompt if profile not yet set
  if (profileReady && !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-100">
            Welcome to Piano Tutor
          </h1>
          <p className="text-sm text-zinc-400">
            Let&apos;s set up your profile so we can tailor lessons to your level and goals.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Get Started →
        </Link>
        <Link href="/lessons" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          Skip for now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Greeting + streak */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            {plan ? plan.greeting : `${timeGreeting}.`}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {plan
              ? plan.focus
              : progressReady && masteredCount > 0
              ? `${masteredCount} of ${EXERCISES.length} exercises mastered`
              : "Ready to practice?"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {progressReady && store.streak > 0 && (
            <div className="rounded-full border border-amber-800 bg-amber-950/30 px-3 py-1.5 text-center">
              <p className="text-lg font-bold text-amber-400 leading-none">
                {store.streak}
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">day streak</p>
            </div>
          )}
        </div>
      </div>

      {/* Connection status */}
      <div
        className={[
          "rounded-lg border p-4 flex items-center justify-between",
          isConnected
            ? "border-emerald-800 bg-emerald-950/20"
            : "border-zinc-800 bg-zinc-900",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              "w-2.5 h-2.5 rounded-full shrink-0",
              isConnected ? "bg-emerald-400" : "bg-zinc-600",
            ].join(" ")}
          />
          <span className="text-sm text-zinc-200">
            {isConnected
              ? deviceName ?? "Piano connected"
              : "No piano connected"}
          </span>
        </div>
        <Link
          href="/connect"
          className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
        >
          {isConnected ? "Change" : "Connect →"}
        </Link>
      </div>

      {/* AI daily plan */}
      {plan ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Today&apos;s Plan
          </h2>
          <ul className="space-y-2">
            {plan.exercises.map((ex) => {
              const exercise = EXERCISES.find((e) => e.id === ex.id);
              if (!exercise) return null;
              const record = progressReady ? store.records[ex.id] : undefined;
              const mastered = record && record.bestAccuracy >= 90;
              return (
                <li key={ex.id}>
                  <Link
                    href={`/lessons/${ex.id}`}
                    className="flex items-start gap-3 rounded-lg border border-indigo-900 bg-indigo-950/20 px-4 py-3 hover:border-indigo-700 hover:bg-indigo-950/40 transition-colors"
                  >
                    <div
                      className={[
                        "w-2 h-2 rounded-full shrink-0 mt-1.5",
                        mastered
                          ? "bg-emerald-400"
                          : record
                          ? "bg-indigo-400"
                          : "bg-zinc-600",
                      ].join(" ")}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100">
                        {ex.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">{ex.reason}</p>
                    </div>
                    <span className="text-indigo-500 text-sm shrink-0">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {plan.tip && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
              <p className="text-xs text-zinc-500">
                <span className="font-medium text-zinc-400">Tip: </span>
                {plan.tip}
              </p>
            </div>
          )}
        </section>
      ) : planLoading ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-5 flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500">Building your daily plan…</p>
        </div>
      ) : nextExercise ? (
        <Link
          href={`/lessons/${nextExercise.id}`}
          className="flex items-center justify-between rounded-lg bg-indigo-600 px-5 py-4 hover:bg-indigo-500 transition-colors"
        >
          <div>
            <p className="text-xs text-indigo-300 mb-0.5">
              {store.records[nextExercise.id] ? "Continue" : "Start here"}
            </p>
            <p className="text-sm font-semibold text-white">
              {nextExercise.title}
            </p>
          </div>
          <span className="text-indigo-300 text-lg">→</span>
        </Link>
      ) : null}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/lessons"
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
        >
          <p className="text-sm font-medium text-zinc-100">Lessons</p>
          <p className="text-xs text-zinc-500 mt-1">All exercises</p>
        </Link>
        <Link
          href="/play"
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
        >
          <p className="text-sm font-medium text-zinc-100">Free Play</p>
          <p className="text-xs text-zinc-500 mt-1">Explore freely</p>
        </Link>
        <Link
          href="/chat"
          className="rounded-lg border border-indigo-900 bg-indigo-950/30 p-4 hover:border-indigo-700 hover:bg-indigo-950/50 transition-colors"
        >
          <p className="text-sm font-medium text-indigo-300">Tutor Chat</p>
          <p className="text-xs text-indigo-500 mt-1">Ask anything</p>
        </Link>
      </div>

      {/* Exercise list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            All Exercises
          </h2>
          <Link
            href="/progress"
            className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            View progress →
          </Link>
        </div>
        <ul className="space-y-2">
          {EXERCISES.map((ex) => {
            const record = progressReady ? store.records[ex.id] : undefined;
            const mastered = record && record.bestAccuracy >= 90;

            return (
              <li key={ex.id}>
                <Link
                  href={`/lessons/${ex.id}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                >
                  <div
                    className={[
                      "w-2 h-2 rounded-full shrink-0",
                      mastered
                        ? "bg-emerald-400"
                        : record
                        ? "bg-indigo-400"
                        : "bg-zinc-700",
                    ].join(" ")}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {ex.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {mastered
                        ? `Mastered · ${record.bestAccuracy}%`
                        : record
                        ? `Best: ${record.bestAccuracy}% · ${record.attempts} attempt${record.attempts !== 1 ? "s" : ""}`
                        : `${ex.level.replace(/_/g, " ")} · ${ex.kind === "musical" ? `${ex.tempo} BPM` : `${ex.sequence.length} notes`}`}
                    </p>
                  </div>
                  {mastered && (
                    <span className="text-xs text-emerald-400 shrink-0">✓</span>
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
