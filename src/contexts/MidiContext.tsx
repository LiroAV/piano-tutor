"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { InputStatus, MidiDevice, NoteEvent, PedalEvent } from "@/types";
import { WebMidiProvider } from "@/lib/midi/WebMidiProvider";
import { OnscreenProvider } from "@/lib/midi/OnscreenProvider";
import { MicrophoneProvider } from "@/lib/midi/MicrophoneProvider";

type ActiveProviderType = "web_midi" | "onscreen" | "microphone" | null;

interface MidiContextValue {
  activeNotes: Map<number, NoteEvent>;
  noteHistory: NoteEvent[];
  pedalOn: boolean;
  status: InputStatus;
  availableDevices: MidiDevice[];
  activeProviderType: ActiveProviderType;

  requestMidiAccess: () => Promise<void>;
  connectDevice: (deviceId: string) => Promise<void>;
  switchToOnscreen: () => Promise<void>;
  switchToMicrophone: () => Promise<void>;
  disconnectAll: () => Promise<void>;
  refreshDevices: () => void;

  triggerOnscreenNoteStart: (noteNumber: number, velocity?: number) => void;
  triggerOnscreenNoteEnd: (noteNumber: number) => void;
}

const MidiContext = createContext<MidiContextValue | null>(null);

const MAX_HISTORY = 50;

export function MidiProvider({ children }: { children: React.ReactNode }) {
  const [activeNotes, setActiveNotes] = useState<Map<number, NoteEvent>>(
    new Map()
  );
  const [noteHistory, setNoteHistory] = useState<NoteEvent[]>([]);
  const [pedalOn, setPedalOn] = useState(false);
  const [status, setStatus] = useState<InputStatus>({ type: "disconnected" });
  const [availableDevices, setAvailableDevices] = useState<MidiDevice[]>([]);
  const [activeProviderType, setActiveProviderType] =
    useState<ActiveProviderType>(null);

  const webMidi = useRef<WebMidiProvider | null>(null);
  const onscreen = useRef<OnscreenProvider | null>(null);
  const microphone = useRef<MicrophoneProvider | null>(null);

  useEffect(() => {
    webMidi.current = new WebMidiProvider();
    onscreen.current = new OnscreenProvider();
    microphone.current = new MicrophoneProvider();

    return () => {
      webMidi.current?.disconnect();
      onscreen.current?.disconnect();
      microphone.current?.disconnect();
    };
  }, []);

  const attachCallbacks = useCallback(
    (provider: WebMidiProvider | OnscreenProvider | MicrophoneProvider) => {
      provider.onNoteStart((event: NoteEvent) => {
        setActiveNotes((prev) => {
          const next = new Map(prev);
          next.set(event.noteNumber, event);
          return next;
        });
        setNoteHistory((prev) => [event, ...prev].slice(0, MAX_HISTORY));
      });

      provider.onNoteEnd((event: NoteEvent) => {
        setActiveNotes((prev) => {
          const next = new Map(prev);
          next.delete(event.noteNumber);
          return next;
        });
      });

      provider.onPedalChange((event: PedalEvent) => {
        if (event.pedal === "sustain") setPedalOn(event.active);
      });
    },
    []
  );

  const disconnectAll = useCallback(async () => {
    await webMidi.current?.disconnect();
    await onscreen.current?.disconnect();
    await microphone.current?.disconnect();
    setStatus({ type: "disconnected" });
    setActiveProviderType(null);
    setActiveNotes(new Map());
  }, []);

  const refreshDevices = useCallback(() => {
    if (webMidi.current) {
      setAvailableDevices(webMidi.current.getAvailableDevices());
    }
  }, []);

  const requestMidiAccess = useCallback(async () => {
    const provider = webMidi.current;
    if (!provider) return;

    setStatus({ type: "connecting" });
    try {
      await provider.connect();
      const devices = provider.getAvailableDevices();
      setAvailableDevices(devices);
      setStatus({ type: "connected" });

      provider.onDeviceChange(() => {
        setAvailableDevices(provider.getAvailableDevices());
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "MIDI access failed";
      setStatus({ type: "error", message });
    }
  }, []);

  const connectDevice = useCallback(
    async (deviceId: string) => {
      const provider = webMidi.current;
      if (!provider) return;

      await microphone.current?.disconnect();
      await onscreen.current?.disconnect();

      await provider.connectDevice(deviceId);
      attachCallbacks(provider);
      setStatus(provider.getStatus());
      setActiveProviderType("web_midi");
    },
    [attachCallbacks]
  );

  const switchToOnscreen = useCallback(async () => {
    const provider = onscreen.current;
    if (!provider) return;

    await webMidi.current?.disconnect();
    await microphone.current?.disconnect();

    await provider.connect();
    attachCallbacks(provider);
    setStatus(provider.getStatus());
    setActiveProviderType("onscreen");
  }, [attachCallbacks]);

  const switchToMicrophone = useCallback(async () => {
    const provider = microphone.current;
    if (!provider) return;

    await webMidi.current?.disconnect();
    await onscreen.current?.disconnect();

    await provider.connect();
    attachCallbacks(provider);
    setStatus(provider.getStatus());
    setActiveProviderType("microphone");
  }, [attachCallbacks]);

  const triggerOnscreenNoteStart = useCallback(
    (noteNumber: number, velocity = 80) => {
      onscreen.current?.triggerNoteStart(noteNumber, velocity);
    },
    []
  );

  const triggerOnscreenNoteEnd = useCallback((noteNumber: number) => {
    onscreen.current?.triggerNoteEnd(noteNumber);
  }, []);

  return (
    <MidiContext.Provider
      value={{
        activeNotes,
        noteHistory,
        pedalOn,
        status,
        availableDevices,
        activeProviderType,
        requestMidiAccess,
        connectDevice,
        switchToOnscreen,
        switchToMicrophone,
        disconnectAll,
        refreshDevices,
        triggerOnscreenNoteStart,
        triggerOnscreenNoteEnd,
      }}
    >
      {children}
    </MidiContext.Provider>
  );
}

export function useMidi(): MidiContextValue {
  const ctx = useContext(MidiContext);
  if (!ctx) throw new Error("useMidi must be used within <MidiProvider>");
  return ctx;
}
