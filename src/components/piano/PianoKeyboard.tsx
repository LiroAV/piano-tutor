"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { isBlackKey, midiNoteToName } from "@/lib/midi/utils";

// Roland FP-10 range: A0 (21) to C8 (108)
const FIRST_NOTE = 21;
const LAST_NOTE = 108;

const WHITE_W = 36;
const WHITE_H = 140;
const BLACK_W = 22;
const BLACK_H = 90;

type KeyData =
  | { noteNumber: number; isBlack: false; whiteIndex: number }
  | { noteNumber: number; isBlack: true; leftWhiteIndex: number };

function buildKeys(): KeyData[] {
  const keys: KeyData[] = [];
  let wi = 0;
  for (let n = FIRST_NOTE; n <= LAST_NOTE; n++) {
    if (isBlackKey(n)) {
      keys.push({ noteNumber: n, isBlack: true, leftWhiteIndex: wi - 1 });
    } else {
      keys.push({ noteNumber: n, isBlack: false, whiteIndex: wi });
      wi++;
    }
  }
  return keys;
}

const ALL_KEYS = buildKeys();
const TOTAL_WHITE = ALL_KEYS.filter((k) => !k.isBlack).length;
const KEYBOARD_WIDTH = TOTAL_WHITE * WHITE_W;

function keyLeft(key: KeyData): number {
  if (!key.isBlack) return key.whiteIndex * WHITE_W;
  return (key.leftWhiteIndex + 1) * WHITE_W - BLACK_W / 2;
}

interface Props {
  activeNotes: Set<number>;
  highlightNote?: number;
  showNoteNames?: boolean;
  onNoteStart?: (noteNumber: number) => void;
  onNoteEnd?: (noteNumber: number) => void;
  className?: string;
}

export function PianoKeyboard({
  activeNotes,
  highlightNote,
  showNoteNames = true,
  onNoteStart,
  onNoteEnd,
  className = "",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pressedKeys = useRef<Set<number>>(new Set());

  // Scroll middle C (60) into view on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const middleCKey = ALL_KEYS.find(
      (k) => k.noteNumber === 60 && !k.isBlack
    );
    if (!middleCKey) return;
    const left = keyLeft(middleCKey);
    const containerWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollLeft = left - containerWidth / 2 + WHITE_W / 2;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, noteNumber: number) => {
      e.preventDefault();
      if (pressedKeys.current.has(noteNumber)) return;
      pressedKeys.current.add(noteNumber);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onNoteStart?.(noteNumber);
    },
    [onNoteStart]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent, noteNumber: number) => {
      e.preventDefault();
      if (!pressedKeys.current.has(noteNumber)) return;
      pressedKeys.current.delete(noteNumber);
      onNoteEnd?.(noteNumber);
    },
    [onNoteEnd]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent, noteNumber: number) => {
      if (!pressedKeys.current.has(noteNumber)) return;
      pressedKeys.current.delete(noteNumber);
      onNoteEnd?.(noteNumber);
    },
    [onNoteEnd]
  );

  const whiteKeys = useMemo(() => ALL_KEYS.filter((k) => !k.isBlack), []);
  const blackKeys = useMemo(() => ALL_KEYS.filter((k) => k.isBlack), []);

  return (
    <div
      ref={scrollRef}
      className={`overflow-x-auto overflow-y-hidden select-none ${className}`}
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      <div
        className="relative"
        style={{ width: KEYBOARD_WIDTH, height: WHITE_H }}
      >
        {/* White keys */}
        {whiteKeys.map((key) => {
          const isActive = activeNotes.has(key.noteNumber);
          const isHighlight = highlightNote === key.noteNumber;
          const noteName = midiNoteToName(key.noteNumber);
          const isC = key.noteNumber % 12 === 0;

          return (
            <div
              key={key.noteNumber}
              onPointerDown={(e) => handlePointerDown(e, key.noteNumber)}
              onPointerUp={(e) => handlePointerUp(e, key.noteNumber)}
              onPointerLeave={(e) => handlePointerLeave(e, key.noteNumber)}
              style={{
                position: "absolute",
                left: keyLeft(key),
                top: 0,
                width: WHITE_W - 1,
                height: WHITE_H,
                zIndex: 0,
              }}
              className={[
                "border border-zinc-300 rounded-b-sm cursor-pointer touch-none",
                "flex items-end justify-center pb-1",
                isActive
                  ? "bg-amber-400 border-amber-500"
                  : isHighlight
                    ? "bg-blue-200 border-blue-400"
                    : "bg-white hover:bg-zinc-50 active:bg-amber-200",
              ].join(" ")}
            >
              {showNoteNames && isC && (
                <span className="text-[9px] font-medium text-zinc-400 pointer-events-none leading-none">
                  {noteName}
                </span>
              )}
            </div>
          );
        })}

        {/* Black keys — rendered on top */}
        {blackKeys.map((key) => {
          const isActive = activeNotes.has(key.noteNumber);
          const isHighlight = highlightNote === key.noteNumber;

          return (
            <div
              key={key.noteNumber}
              onPointerDown={(e) => handlePointerDown(e, key.noteNumber)}
              onPointerUp={(e) => handlePointerUp(e, key.noteNumber)}
              onPointerLeave={(e) => handlePointerLeave(e, key.noteNumber)}
              style={{
                position: "absolute",
                left: keyLeft(key),
                top: 0,
                width: BLACK_W,
                height: BLACK_H,
                zIndex: 1,
              }}
              className={[
                "rounded-b-sm cursor-pointer touch-none",
                isActive
                  ? "bg-amber-500"
                  : isHighlight
                    ? "bg-blue-500"
                    : "bg-zinc-900 hover:bg-zinc-700 active:bg-amber-600",
              ].join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
