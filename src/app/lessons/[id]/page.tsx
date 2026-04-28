"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMidi } from "@/contexts/MidiContext";
import { PianoKeyboard } from "@/components/piano/PianoKeyboard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FallingNotes, MusicalFallingNotes, FALLING_H, MUSICAL_FALLING_H } from "@/components/FallingNotes";
import { usePracticeSession } from "@/lib/practice/session";
import { useMusicalSession } from "@/lib/practice/musicalSession";
import { getExercise, EXERCISES } from "@/lib/practice/exercises";
import { useProgress } from "@/lib/practice/progress";
import { midiNoteToName } from "@/lib/midi/utils";
import { keyLeft, keyWidth, KEYBOARD_WIDTH, WHITE_H } from "@/lib/midi/keyLayout";
import type { MusicalExercise, SequenceExercise } from "@/lib/practice/types";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const exercise = getExercise(id);

  if (!exercise) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <p className="text-zinc-400 text-sm">Exercise not found.</p>
        <Link href="/lessons" className="text-sm text-indigo-400 hover:text-indigo-300">← Back to Lessons</Link>
      </div>
    );
  }

  return exercise.kind === "musical"
    ? <MusicalPractice exercise={exercise} />
    : <SequencePractice exercise={exercise as SequenceExercise} />;
}

// ── Sequence practice (existing simple exercises) ─────────────────────────────
function SequencePractice({ exercise }: { exercise: SequenceExercise }) {
  const { activeNotes, status, activeProviderType, triggerOnscreenNoteStart, triggerOnscreenNoteEnd } = useMidi();
  const { state, reset } = usePracticeSession(exercise);
  const { saveResult } = useProgress();
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const savedRef = useRef(false);
  const pianoScrollRef = useRef<HTMLDivElement>(null);

  const activeNoteNumbers = useMemo(() => new Set(activeNotes.keys()), [activeNotes]);
  const isOnscreen = activeProviderType === "onscreen";
  const isConnected = status.type === "connected" && activeProviderType !== null;
  const currentNote = state.phase === "playing" ? exercise.sequence[state.currentNoteIndex] : undefined;

  const exerciseIndex = EXERCISES.findIndex((e) => e.id === exercise.id);
  const nextExercise = EXERCISES[exerciseIndex + 1];

  useEffect(() => {
    if (state.phase !== "done" || !state.result || savedRef.current) return;
    savedRef.current = true;
    saveResult(state.result, exercise.sequence.length);
  }, [state.phase, state.result, saveResult, exercise.sequence.length]);

  useEffect(() => {
    if (!currentNote || !pianoScrollRef.current) return;
    const noteCenter = keyLeft(currentNote) + keyWidth(currentNote) / 2;
    const containerW = pianoScrollRef.current.clientWidth;
    pianoScrollRef.current.scrollLeft = noteCenter - containerW / 2;
  }, [currentNote]);

  useEffect(() => {
    if (state.phase !== "done" || !state.result || aiFeedback !== null) return;
    setLoadingFeedback(true);
    fetch("/api/tutor/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise, result: state.result }),
    })
      .then((r) => r.json())
      .then((data: { feedback: string }) => setAiFeedback(data.feedback))
      .catch(() => setAiFeedback("Great work completing the exercise! Keep practicing to build muscle memory."))
      .finally(() => setLoadingFeedback(false));
  }, [state.phase, state.result, exercise, aiFeedback]);

  return (
    <PracticeLayout
      exercise={exercise}
      isConnected={isConnected}
      phase={state.phase}
      progress={{ current: state.currentNoteIndex, total: exercise.sequence.length }}
      result={state.result}
      aiFeedback={aiFeedback}
      loadingFeedback={loadingFeedback}
      lastResult={state.lastResult}
      nextExercise={nextExercise}
      onReset={() => { reset(); setAiFeedback(null); savedRef.current = false; }}
      statusSlot={<StatusBadge status={status} />}
      pianoScrollRef={pianoScrollRef}
      statusIndicator={
        state.phase === "playing" ? (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Play</span>
              <span className="text-base font-bold text-amber-400">
                {currentNote !== undefined ? midiNoteToName(currentNote) : "—"}
              </span>
              {state.lastResult === "wrong" && <span className="text-xs text-red-400">not quite, try again</span>}
            </div>
            <span className="text-xs text-zinc-600">{state.currentNoteIndex + 1} / {exercise.sequence.length}</span>
          </div>
        ) : null
      }
      fallingNotes={
        state.phase === "playing" ? (
          <FallingNotes sequence={exercise.sequence} currentIndex={state.currentNoteIndex} lastResult={state.lastResult} />
        ) : null
      }
      fallingH={FALLING_H}
      keyboard={
        <PianoKeyboard
          activeNotes={activeNoteNumbers}
          highlightNote={currentNote}
          onNoteStart={isOnscreen ? triggerOnscreenNoteStart : undefined}
          onNoteEnd={isOnscreen ? triggerOnscreenNoteEnd : undefined}
        />
      }
      isOnscreen={isOnscreen}
    />
  );
}

// ── Musical practice (both hands, timing) ─────────────────────────────────────
function MusicalPractice({ exercise }: { exercise: MusicalExercise }) {
  const { activeNotes, status, activeProviderType, triggerOnscreenNoteStart, triggerOnscreenNoteEnd } = useMidi();
  const { state, steps, reset } = useMusicalSession(exercise);
  const { saveResult } = useProgress();
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const savedRef = useRef(false);
  const pianoScrollRef = useRef<HTMLDivElement>(null);

  const activeNoteNumbers = useMemo(() => new Set(activeNotes.keys()), [activeNotes]);
  const isOnscreen = activeProviderType === "onscreen";
  const isConnected = status.type === "connected" && activeProviderType !== null;

  const currentStep = steps[state.stepIndex];
  const highlightNotes = useMemo(
    () => (currentStep ? new Set(currentStep.notes.map((n) => n.midi)) : new Set<number>()),
    [currentStep]
  );

  // Scroll keyboard to keep current step notes centered
  useEffect(() => {
    if (!currentStep || !pianoScrollRef.current) return;
    const midis = currentStep.notes.map((n) => n.midi);
    const leftmost = Math.min(...midis.map((m) => keyLeft(m)));
    const rightmost = Math.max(...midis.map((m) => keyLeft(m) + keyWidth(m)));
    const center = (leftmost + rightmost) / 2;
    const containerW = pianoScrollRef.current.clientWidth;
    pianoScrollRef.current.scrollLeft = center - containerW / 2;
  }, [currentStep]);

  const exerciseIndex = EXERCISES.findIndex((e) => e.id === exercise.id);
  const nextExercise = EXERCISES[exerciseIndex + 1];

  useEffect(() => {
    if (state.phase !== "done" || !state.result || savedRef.current) return;
    savedRef.current = true;
    saveResult(state.result, steps.length);
  }, [state.phase, state.result, saveResult, steps.length]);

  useEffect(() => {
    if (state.phase !== "done" || !state.result || aiFeedback !== null) return;
    setLoadingFeedback(true);
    fetch("/api/tutor/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise, result: state.result }),
    })
      .then((r) => r.json())
      .then((data: { feedback: string }) => setAiFeedback(data.feedback))
      .catch(() => setAiFeedback("Great work completing the exercise! Keep practicing."))
      .finally(() => setLoadingFeedback(false));
  }, [state.phase, state.result, exercise, aiFeedback]);

  // Build "what to play now" label
  const currentStepLabel = useMemo(() => {
    if (!currentStep) return null;
    const byHand = { left: [] as string[], right: [] as string[] };
    for (const note of currentStep.notes) {
      byHand[note.hand].push(midiNoteToName(note.midi));
    }
    const parts: string[] = [];
    if (byHand.right.length) parts.push(`RH: ${byHand.right.join(" + ")}`);
    if (byHand.left.length) parts.push(`LH: ${byHand.left.join(" + ")}`);
    return parts.join("  |  ");
  }, [currentStep]);

  return (
    <PracticeLayout
      exercise={exercise}
      isConnected={isConnected}
      phase={state.phase}
      progress={{ current: state.stepIndex, total: steps.length }}
      result={state.result}
      aiFeedback={aiFeedback}
      loadingFeedback={loadingFeedback}
      lastResult={state.lastResult}
      nextExercise={nextExercise}
      onReset={() => { reset(); setAiFeedback(null); savedRef.current = false; }}
      statusSlot={<StatusBadge status={status} />}
      pianoScrollRef={pianoScrollRef}
      statusIndicator={
        state.phase === "playing" ? (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-zinc-500 shrink-0">Play</span>
              <span className={`text-sm font-bold truncate ${state.lastResult === "wrong" ? "text-red-400" : "text-amber-400"}`}>
                {currentStepLabel ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-[10px] text-zinc-600">
                {exercise.tempo} BPM · {exercise.timeSignature[0]}/{exercise.timeSignature[1]}
              </span>
              <span className="text-xs text-zinc-600">{state.stepIndex + 1} / {steps.length}</span>
            </div>
          </div>
        ) : null
      }
      fallingNotes={
        state.phase === "playing" ? (
          <MusicalFallingNotes steps={steps} currentStepIndex={state.stepIndex} lastResult={state.lastResult} />
        ) : null
      }
      fallingH={MUSICAL_FALLING_H}
      keyboard={
        <PianoKeyboard
          activeNotes={activeNoteNumbers}
          highlightNotes={highlightNotes}
          onNoteStart={isOnscreen ? triggerOnscreenNoteStart : undefined}
          onNoteEnd={isOnscreen ? triggerOnscreenNoteEnd : undefined}
        />
      }
      isOnscreen={isOnscreen}
    />
  );
}

// ── Shared layout shell ───────────────────────────────────────────────────────
interface PracticeLayoutProps {
  exercise: { id: string; title: string; description: string };
  isConnected: boolean;
  phase: "playing" | "done";
  progress: { current: number; total: number };
  result: { correctFirstTry: number; totalWrongAttempts: number; durationMs: number } | null;
  aiFeedback: string | null;
  loadingFeedback: boolean;
  lastResult: "correct" | "wrong" | null;
  nextExercise: { id: string; title: string } | undefined;
  onReset: () => void;
  statusSlot: React.ReactNode;
  pianoScrollRef: React.RefObject<HTMLDivElement | null>;
  statusIndicator: React.ReactNode;
  fallingNotes: React.ReactNode;
  fallingH: number;
  keyboard: React.ReactNode;
  isOnscreen: boolean;
}

function PracticeLayout({
  exercise, isConnected, phase, progress, result, aiFeedback, loadingFeedback,
  nextExercise, onReset, statusSlot, pianoScrollRef, statusIndicator,
  fallingNotes, fallingH, keyboard, isOnscreen,
}: PracticeLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/lessons" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">← Lessons</Link>
          <span className="text-zinc-700 shrink-0">|</span>
          <h1 className="text-sm font-semibold text-zinc-200 truncate">{exercise.title}</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {statusSlot}
          {!isConnected && (
            <Link href="/connect" className="text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap">Connect Piano</Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        <p className="text-sm text-zinc-400">{exercise.description}</p>

        {!isConnected && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-center text-sm text-zinc-400">
            Connect your piano or use the on-screen keyboard to start.{" "}
            <Link href="/connect" className="text-indigo-400 hover:text-indigo-300">Connect →</Link>
          </div>
        )}

        {phase === "playing" ? statusIndicator : (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-800 bg-emerald-950/20 p-6 text-center">
              <p className="text-xl font-bold text-emerald-400">Exercise Complete!</p>
              {result && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <Stat label="First-try accuracy" value={`${Math.round((result.correctFirstTry / progress.total) * 100)}%`} />
                  <Stat label="Wrong attempts" value={String(result.totalWrongAttempts)} />
                  <Stat label="Duration" value={`${Math.round(result.durationMs / 1000)}s`} />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Tutor Feedback</p>
              {loadingFeedback ? (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Analyzing your performance…
                </div>
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed">{aiFeedback}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onReset}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href={nextExercise ? `/lessons/${nextExercise.id}` : "/lessons"}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors text-center"
              >
                {nextExercise ? `Next: ${nextExercise.title}` : "All Lessons"}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Falling notes + keyboard */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950">
        <div
          ref={pianoScrollRef}
          className="overflow-x-auto overflow-y-hidden"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {phase === "playing" && (
            <div style={{ width: KEYBOARD_WIDTH, height: fallingH }}>
              {fallingNotes}
            </div>
          )}
          <div style={{ height: WHITE_H, width: KEYBOARD_WIDTH }}>
            {keyboard}
          </div>
        </div>
        {isOnscreen && (
          <p className="text-center text-xs text-zinc-600 py-1">Click or tap keys to play</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-semibold text-zinc-200">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}
