"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMidi } from "@/contexts/MidiContext";
import { PianoKeyboard } from "@/components/piano/PianoKeyboard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function PlayPage() {
  const {
    activeNotes,
    noteHistory,
    pedalOn,
    status,
    activeProviderType,
    triggerOnscreenNoteStart,
    triggerOnscreenNoteEnd,
  } = useMidi();

  const activeNoteNumbers = useMemo(
    () => new Set(activeNotes.keys()),
    [activeNotes]
  );

  const sortedActiveNotes = useMemo(
    () =>
      Array.from(activeNotes.values()).sort(
        (a, b) => a.noteNumber - b.noteNumber
      ),
    [activeNotes]
  );

  const lastNote = noteHistory[0];
  const isOnscreen = activeProviderType === "onscreen";
  const isConnected =
    status.type === "connected" && activeProviderType !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <h1 className="text-sm font-semibold text-zinc-200">Free Play</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <Link
            href="/connect"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isConnected ? "Change Input" : "Connect Piano →"}
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Not connected state */}
        {!isConnected && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400 text-sm">
              No piano connected. Connect your Roland FP-10 or use the on-screen
              keyboard to start.
            </p>
            <Link
              href="/connect"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Connect Piano
            </Link>
          </div>
        )}

        {/* Active notes — large display */}
        {isConnected && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 min-h-[100px]">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Playing Now
            </p>
            {sortedActiveNotes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sortedActiveNotes.map((note) => (
                  <span
                    key={note.noteNumber}
                    className="inline-flex flex-col items-center rounded-lg bg-amber-500/20 border border-amber-500/50 px-4 py-2"
                  >
                    <span className="text-2xl font-bold text-amber-400 leading-none">
                      {note.noteName}
                    </span>
                    <span className="text-xs text-amber-600 mt-1">
                      vel {note.velocity}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm italic">Play a key…</p>
            )}
          </div>
        )}

        {/* Last note + stats */}
        {lastNote && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Last Note", value: lastNote.noteName },
              { label: "Velocity", value: String(lastNote.velocity) },
              { label: "MIDI #", value: String(lastNote.noteNumber) },
              { label: "Source", value: lastNote.source },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-center"
              >
                <p className="text-lg font-semibold text-zinc-200 capitalize">
                  {value}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pedal indicator */}
        {isConnected && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Sustain Pedal</span>
            <span
              className={[
                "text-xs font-medium px-2 py-0.5 rounded-full",
                pedalOn
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "bg-zinc-800 text-zinc-500 border border-zinc-700",
              ].join(" ")}
            >
              {pedalOn ? "ON" : "OFF"}
            </span>
          </div>
        )}

        {/* Note history */}
        {noteHistory.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Recent Notes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {noteHistory.slice(0, 20).map((note, i) => (
                <span
                  key={note.id}
                  className={[
                    "text-xs px-2 py-1 rounded border font-medium transition-all",
                    i === 0
                      ? "bg-zinc-700 border-zinc-600 text-zinc-100"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400",
                  ].join(" ")}
                >
                  {note.noteName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Piano keyboard — pinned to bottom */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 py-4">
        <PianoKeyboard
          activeNotes={activeNoteNumbers}
          onNoteStart={isOnscreen ? triggerOnscreenNoteStart : undefined}
          onNoteEnd={isOnscreen ? triggerOnscreenNoteEnd : undefined}
          className="px-2"
        />
        {isOnscreen && (
          <p className="text-center text-xs text-zinc-600 mt-2">
            Click or tap keys to play
          </p>
        )}
      </div>
    </div>
  );
}
