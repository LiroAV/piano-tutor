"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMidi } from "@/contexts/MidiContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { NoteEvent } from "@/types";

export default function ConnectPage() {
  const {
    status,
    availableDevices,
    activeProviderType,
    requestMidiAccess,
    connectDevice,
    switchToOnscreen,
    noteHistory,
  } = useMidi();

  const [midiAccessRequested, setMidiAccessRequested] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const lastNote: NoteEvent | undefined = noteHistory[0];

  const handleScan = useCallback(async () => {
    setMidiAccessRequested(true);
    await requestMidiAccess();
  }, [requestMidiAccess]);

  const handleConnect = useCallback(
    async (deviceId: string) => {
      setConnectingId(deviceId);
      try {
        await connectDevice(deviceId);
      } finally {
        setConnectingId(null);
      }
    },
    [connectDevice]
  );

  // Auto-scan on mount if already permitted (best-effort)
  useEffect(() => {
    if (!midiAccessRequested) {
      requestMidiAccess().catch(() => {});
      setMidiAccessRequested(true);
    }
  }, [midiAccessRequested, requestMidiAccess]);

  const isConnected = status.type === "connected";
  const activeDeviceName =
    status.type === "connected" ? status.deviceName : undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Connect Your Piano
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Connect via USB MIDI or use the on-screen keyboard
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* MIDI Devices */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
            MIDI Devices
          </h2>
          <button
            onClick={handleScan}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {status.type === "error" && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300">
            {status.message}
            <p className="mt-1 text-red-400/70">
              Make sure you&apos;re using Chrome or Edge and the page is served
              over HTTPS or localhost.
            </p>
          </div>
        )}

        {availableDevices.length === 0 && status.type !== "error" ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-zinc-400 text-sm">
              {status.type === "connecting"
                ? "Scanning for MIDI devices…"
                : "No MIDI devices found. Plug in your piano via USB and click Refresh."}
            </p>
            {status.type === "disconnected" && (
              <button
                onClick={handleScan}
                className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Scan for Devices
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {availableDevices.map((device) => {
              const isActive =
                activeProviderType === "web_midi" &&
                activeDeviceName === device.name;
              return (
                <li
                  key={device.id}
                  className={[
                    "flex items-center justify-between rounded-lg border p-4",
                    isActive
                      ? "border-indigo-600 bg-indigo-950/40"
                      : "border-zinc-800 bg-zinc-900",
                  ].join(" ")}
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {device.name}
                    </p>
                    {device.manufacturer && (
                      <p className="text-xs text-zinc-500">
                        {device.manufacturer}
                      </p>
                    )}
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(device.id)}
                      disabled={connectingId === device.id}
                      className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-600 disabled:opacity-50 transition-colors"
                    >
                      {connectingId === device.id ? "Connecting…" : "Use This"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-zinc-800" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="flex-1 border-t border-zinc-800" />
      </div>

      {/* On-screen keyboard fallback */}
      <section>
        <button
          onClick={switchToOnscreen}
          className={[
            "w-full rounded-lg border p-4 text-sm font-medium transition-colors text-left",
            activeProviderType === "onscreen"
              ? "border-indigo-600 bg-indigo-950/40 text-indigo-300"
              : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <span>Use On-Screen Keyboard</span>
            {activeProviderType === "onscreen" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Active
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 font-normal">
            Click or tap keys on the piano — no hardware required
          </p>
        </button>
      </section>

      {/* Connection Test */}
      {isConnected && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
            Connection Test
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <p className="text-sm text-zinc-400">
              Play any key on your piano to verify the connection.
            </p>
            {lastNote ? (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">
                    {lastNote.noteName}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Note</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-zinc-200">
                    {lastNote.velocity}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Velocity</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-zinc-200 capitalize">
                    {lastNote.source}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Source</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-zinc-200">
                    {lastNote.noteNumber}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">MIDI #</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                Waiting for input…
              </div>
            )}
          </div>
        </section>
      )}

      {/* Go to Play */}
      {isConnected && (
        <Link
          href="/play"
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Start Playing →
        </Link>
      )}
    </div>
  );
}
