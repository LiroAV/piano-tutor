"use client";

import { keyLeft, keyWidth, isBlackKey, KEYBOARD_WIDTH } from "@/lib/midi/keyLayout";
import type { MusicalStep } from "@/lib/practice/musicalSession";

// ── Shared constants ──────────────────────────────────────────────────────────
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// ── Sequence FallingNotes (original, no timing) ───────────────────────────────
const SEQ_TILE_H = 44;
const SEQ_TILE_GAP = 10;
const SEQ_TILE_STRIDE = SEQ_TILE_H + SEQ_TILE_GAP;
export const FALLING_H = 280;
const SEQ_HIT_Y = FALLING_H - 60;

interface FallingNotesProps {
  sequence: number[];
  currentIndex: number;
  lastResult: "correct" | "wrong" | null;
}

export function FallingNotes({ sequence, currentIndex, lastResult }: FallingNotesProps) {
  if (sequence.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ width: KEYBOARD_WIDTH, height: FALLING_H, background: "#08080e" }}
    >
      {Array.from(new Set(sequence)).map((note) => (
        <div
          key={note}
          className="absolute top-0 bottom-0"
          style={{ left: keyLeft(note), width: keyWidth(note), background: "rgba(255,255,255,0.022)" }}
        />
      ))}

      <div
        className="absolute inset-x-0"
        style={{
          top: SEQ_HIT_Y,
          height: SEQ_TILE_H,
          background: "rgba(99,102,241,0.08)",
          borderTop: "1px solid rgba(99,102,241,0.45)",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
          zIndex: 2,
        }}
      />
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 70, background: "linear-gradient(to bottom, #08080e 10%, transparent)", zIndex: 5 }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: 36, background: "linear-gradient(to top, #08080e, transparent)", zIndex: 5 }} />

      {sequence.map((note, i) => {
        const dist = i - currentIndex;
        if (dist < -3 || dist > 12) return null;
        const top = SEQ_HIT_Y - dist * SEQ_TILE_STRIDE;
        const black = isBlackKey(note);
        const isCurrent = dist === 0;
        const isPast = dist < 0;
        let bg: string;
        if (isPast) bg = "rgb(52,211,153)";
        else if (isCurrent) bg = lastResult === "wrong" ? "rgb(239,68,68)" : "rgb(245,158,11)";
        else bg = "rgb(99,102,241)";
        const opacity = isPast ? Math.max(0, 0.45 + dist * 0.18) : isCurrent ? 1 : Math.max(0.18, 1 - dist * 0.1);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: keyLeft(note),
              width: keyWidth(note),
              top,
              height: SEQ_TILE_H,
              background: bg,
              opacity,
              borderRadius: 6,
              zIndex: isCurrent ? 3 : 1,
              boxShadow: isCurrent ? (lastResult === "wrong" ? "0 0 16px rgba(239,68,68,0.5)" : "0 0 16px rgba(245,158,11,0.45)") : undefined,
              transition: "top 0.17s cubic-bezier(0.4,0,0.2,1), background 0.12s ease, opacity 0.17s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {dist <= 5 && (
              <span style={{ fontSize: black ? 8 : 10, fontWeight: 700, color: isCurrent ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)", letterSpacing: "0.04em", userSelect: "none", pointerEvents: "none" }}>
                {NOTE_NAMES[note % 12]}
              </span>
            )}
          </div>
        );
      })}

      <div className="absolute right-2 text-[9px] font-semibold text-zinc-600 pointer-events-none" style={{ top: SEQ_HIT_Y + SEQ_TILE_H / 2 - 6, zIndex: 6 }}>
        NOW
      </div>
    </div>
  );
}

// ── Musical FallingNotes (both hands, correct durations) ─────────────────────
// Tiles are positioned by beat distance from the current step's beat.
// Each 1 beat = PIXELS_PER_BEAT px. The BOTTOM of a tile touches HIT_Y when it's current.
const MUSICAL_H = 320;
const HIT_Y = 260; // distance from top to the hit line
const PIXELS_PER_BEAT = 60;

// Colour palette: right hand amber/indigo, left hand sky/teal
function tileColor(hand: "left" | "right", state: "current" | "future" | "past" | "wrong"): string {
  if (state === "wrong") return "rgb(239,68,68)";
  if (hand === "right") {
    if (state === "current") return "rgb(245,158,11)";  // amber
    if (state === "future") return "rgb(99,102,241)";   // indigo
    return "rgb(52,211,153)";                           // emerald (past)
  } else {
    if (state === "current") return "rgb(56,189,248)";  // sky-400
    if (state === "future") return "rgb(139,92,246)";   // violet-500
    return "rgb(45,212,191)";                           // teal (past)
  }
}

interface MusicalFallingNotesProps {
  steps: MusicalStep[];
  currentStepIndex: number;
  lastResult: "correct" | "wrong" | null;
}

export function MusicalFallingNotes({ steps, currentStepIndex, lastResult }: MusicalFallingNotesProps) {
  if (steps.length === 0) return null;

  const currentBeat = steps[Math.min(currentStepIndex, steps.length - 1)]?.beat ?? 0;

  // Visible beat range: from (currentBeat - pastBeats) to (currentBeat + futureBeats)
  const futureBeats = HIT_Y / PIXELS_PER_BEAT + 1;
  const pastBeats = (MUSICAL_H - HIT_Y) / PIXELS_PER_BEAT + 1;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ width: KEYBOARD_WIDTH, height: MUSICAL_H, background: "#08080e" }}
    >
      {/* Hit line */}
      <div
        className="absolute inset-x-0"
        style={{
          top: HIT_Y,
          height: 2,
          background: "rgba(99,102,241,0.6)",
          boxShadow: "0 0 8px rgba(99,102,241,0.4)",
          zIndex: 4,
        }}
      />

      {/* Top + bottom gradients */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 60, background: "linear-gradient(to bottom, #08080e 10%, transparent)", zIndex: 5 }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: 40, background: "linear-gradient(to top, #08080e, transparent)", zIndex: 5 }} />

      {/* Render all visible notes */}
      {steps.flatMap((step, si) =>
        step.notes
          .filter(() => {
            const dist = step.beat - currentBeat;
            return dist >= -pastBeats && dist <= futureBeats;
          })
          .map((note, ni) => {
            const beatDist = step.beat - currentBeat; // positive = future, negative = past
            const tileH = Math.max(14, note.duration * PIXELS_PER_BEAT);
            // Bottom of tile at HIT_Y when beatDist = 0
            const bottomY = HIT_Y - beatDist * PIXELS_PER_BEAT;
            const topY = bottomY - tileH;

            const isCurrent = si === currentStepIndex;
            const isPast = si < currentStepIndex;
            const stateLabel =
              isCurrent && lastResult === "wrong"
                ? "wrong"
                : isCurrent
                ? "current"
                : isPast
                ? "past"
                : "future";

            const bg = tileColor(note.hand, stateLabel);
            const opacity =
              isPast ? Math.max(0.15, 0.5 - Math.abs(beatDist) * 0.1) :
              isCurrent ? 1 :
              Math.max(0.2, 1 - beatDist * 0.05);

            const black = isBlackKey(note.midi);

            return (
              <div
                key={`${si}-${ni}`}
                style={{
                  position: "absolute",
                  left: keyLeft(note.midi),
                  width: keyWidth(note.midi),
                  top: topY,
                  height: tileH,
                  background: bg,
                  opacity,
                  borderRadius: 5,
                  zIndex: isCurrent ? 3 : 1,
                  boxShadow: isCurrent && stateLabel !== "wrong"
                    ? `0 0 12px ${note.hand === "right" ? "rgba(245,158,11,0.5)" : "rgba(56,189,248,0.5)"}`
                    : isCurrent && stateLabel === "wrong"
                    ? "0 0 14px rgba(239,68,68,0.6)"
                    : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {tileH >= 18 && (
                  <span
                    style={{
                      fontSize: black ? 7 : 9,
                      fontWeight: 700,
                      color: isCurrent ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {NOTE_NAMES[note.midi % 12]}
                  </span>
                )}
              </div>
            );
          })
      )}

      {/* Hand legend */}
      <div className="absolute top-2 left-3 flex gap-3 pointer-events-none" style={{ zIndex: 6 }}>
        <span className="text-[9px] font-semibold" style={{ color: "rgb(245,158,11)" }}>▮ Right</span>
        <span className="text-[9px] font-semibold" style={{ color: "rgb(56,189,248)" }}>▮ Left</span>
      </div>

      {/* NOW label */}
      <div className="absolute right-2 text-[9px] font-semibold text-zinc-600 pointer-events-none" style={{ top: HIT_Y - 6, zIndex: 6 }}>
        NOW
      </div>
    </div>
  );
}

export { MUSICAL_H as MUSICAL_FALLING_H };
