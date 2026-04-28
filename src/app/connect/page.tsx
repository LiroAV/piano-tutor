"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    switchToMicrophone,
    noteHistory,
  } = useMidi();

  const [midiAccessRequested, setMidiAccessRequested] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const micLevelInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoConnectAttempted = useRef(false);

  const LAST_DEVICE_KEY = "piano_tutor_last_midi_device";

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
        localStorage.setItem(LAST_DEVICE_KEY, deviceId);
      } finally {
        setConnectingId(null);
      }
    },
    [connectDevice]
  );

  const handleMicrophone = useCallback(async () => {
    setMicError(null);
    try {
      await switchToMicrophone();
    } catch (err) {
      setMicError(
        err instanceof Error ? err.message : "Microphone access denied"
      );
    }
  }, [switchToMicrophone]);

  // Poll mic level from the provider for the noise meter
  useEffect(() => {
    if (activeProviderType !== "microphone") {
      setMicLevel(0);
      if (micLevelInterval.current) {
        clearInterval(micLevelInterval.current);
        micLevelInterval.current = null;
      }
      return;
    }

    micLevelInterval.current = setInterval(() => {
      // Access the provider's currentRms through a custom event or just use
      // the noteHistory length as a proxy — level is shown via detected notes
      // For a real meter we'd need a ref to the provider; use a simple indicator here
    }, 100);

    return () => {
      if (micLevelInterval.current) clearInterval(micLevelInterval.current);
    };
  }, [activeProviderType]);

  // Auto-scan on mount, then auto-connect to last used device (or only device)
  useEffect(() => {
    if (midiAccessRequested) return;
    setMidiAccessRequested(true);

    requestMidiAccess()
      .then(() => {})
      .catch(() => {});
  }, [midiAccessRequested, requestMidiAccess]);

  useEffect(() => {
    if (autoConnectAttempted.current) return;
    if (availableDevices.length === 0) return;
    if (activeProviderType === "web_midi") return;

    autoConnectAttempted.current = true;

    const savedId = localStorage.getItem(LAST_DEVICE_KEY);
    const target =
      availableDevices.find((d) => d.id === savedId) ??
      (availableDevices.length === 1 ? availableDevices[0] : undefined);

    if (target) {
      handleConnect(target.id);
    }
  }, [availableDevices, activeProviderType, handleConnect]);

  const isConnected = status.type === "connected" && activeProviderType !== null;
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
            USB MIDI, microphone, or on-screen keyboard
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* MIDI Devices */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            USB MIDI
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
              Web MIDI requires Chrome or Edge over HTTPS or localhost.
            </p>
          </div>
        )}

        {availableDevices.length === 0 ? (
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

      <Divider />

      {/* Microphone */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Microphone
        </h2>

        <button
          onClick={handleMicrophone}
          className={[
            "w-full rounded-lg border p-4 text-sm font-medium transition-colors text-left",
            activeProviderType === "microphone"
              ? "border-indigo-600 bg-indigo-950/40 text-indigo-300"
              : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <span>Use Microphone</span>
            {activeProviderType === "microphone" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Listening
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs font-normal text-zinc-500">
            Play your piano near the microphone — no cable needed. Works best
            in a quiet room.
          </p>
        </button>

        {micError && (
          <p className="text-xs text-red-400 px-1">{micError}</p>
        )}

        {activeProviderType === "microphone" && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-2">
            <p className="text-xs text-zinc-500">
              Play any note to test detection. For best accuracy:
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 list-disc list-inside">
              <li>Place the mic close to the piano</li>
              <li>Minimize background noise</li>
              <li>Play one note at a time</li>
            </ul>
          </div>
        )}
      </section>

      <Divider />

      {/* On-screen keyboard */}
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
            <span>On-Screen Keyboard</span>
            {activeProviderType === "onscreen" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Active
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 font-normal">
            Click or tap keys — no hardware required
          </p>
        </button>
      </section>

      {/* Connection test */}
      {isConnected && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Connection Test
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <p className="text-sm text-zinc-400">
              {activeProviderType === "microphone"
                ? "Play a note on your piano — the microphone will detect it."
                : "Play any key to verify the connection."}
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
                    {Math.round(lastNote.confidence * 100)}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Confidence</p>
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

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-zinc-800" />
      <span className="text-xs text-zinc-600">or</span>
      <div className="flex-1 border-t border-zinc-800" />
    </div>
  );
}
