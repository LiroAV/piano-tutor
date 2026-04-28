import type { MusicNote, MusicalExercise } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function n(beat: number, dur: number, midi: number, hand: "left" | "right"): MusicNote {
  return {
    beat: Math.round(beat * 1000) / 1000,
    duration: Math.round(dur * 1000) / 1000,
    midi,
    hand,
  };
}

// Repeat a bar-pattern (defined from beat 0) for `times` bars, each `barBeats` wide
function rep(pattern: MusicNote[], times: number, barBeats: number): MusicNote[] {
  const out: MusicNote[] = [];
  for (let i = 0; i < times; i++) {
    for (const note of pattern) {
      out.push(n(note.beat + i * barBeats, note.duration, note.midi, note.hand));
    }
  }
  return out;
}

// Generate triplets (3 per beat) over `totalBeats` quarter-note beats
function triplets(
  startBeat: number,
  totalBeats: number,
  [m1, m2, m3]: [number, number, number],
  hand: "left" | "right"
): MusicNote[] {
  const count = Math.round(totalBeats * 3);
  return Array.from({ length: count }, (_, i) =>
    n(startBeat + i / 3, 1 / 3, [m1, m2, m3][i % 3], hand)
  );
}

// Generate block-chord on every 8th note (0.5 beats) over `totalBeats`
function chords8(
  startBeat: number,
  totalBeats: number,
  midis: number[],
  hand: "left" | "right"
): MusicNote[] {
  const count = Math.round(totalBeats * 2);
  const out: MusicNote[] = [];
  for (let i = 0; i < count; i++) {
    const beat = startBeat + i * 0.5;
    for (const midi of midis) out.push(n(beat, 0.5, midi, hand));
  }
  return out;
}

// ── 1. Prelude in C Major, BWV 846 — J.S. Bach ───────────────────────────────
// 8 bars, 4/4, 72 BPM. Each bar: LH bass eighth-note, then 7 RH arpeggiation notes.
// Chord progression: C – Am – Dm – G7 – C/E – Am – D/F# – G
const bachNotes: MusicNote[] = [
  // Bar 1: C major (bass C2, arpeggio C4-E4-G4-C5-G4-E4-C4)
  n(0.0, 0.5, 36, "left"), n(0.5, 0.5, 60, "right"), n(1.0, 0.5, 64, "right"),
  n(1.5, 0.5, 67, "right"), n(2.0, 0.5, 72, "right"), n(2.5, 0.5, 67, "right"),
  n(3.0, 0.5, 64, "right"), n(3.5, 0.5, 60, "right"),
  // Bar 2: A minor (bass A2, arpeggio A3-C4-E4-A4-E4-C4-A3)
  n(4.0, 0.5, 45, "left"), n(4.5, 0.5, 57, "right"), n(5.0, 0.5, 60, "right"),
  n(5.5, 0.5, 64, "right"), n(6.0, 0.5, 69, "right"), n(6.5, 0.5, 64, "right"),
  n(7.0, 0.5, 60, "right"), n(7.5, 0.5, 57, "right"),
  // Bar 3: D minor (bass D2, arpeggio D3-F3-A3-D4-A3-F3-D3)
  n(8.0, 0.5, 38, "left"), n(8.5, 0.5, 50, "right"), n(9.0, 0.5, 53, "right"),
  n(9.5, 0.5, 57, "right"), n(10.0, 0.5, 62, "right"), n(10.5, 0.5, 57, "right"),
  n(11.0, 0.5, 53, "right"), n(11.5, 0.5, 50, "right"),
  // Bar 4: G7 (bass G2, arpeggio G3-B3-D4-F4-D4-B3-G3)
  n(12.0, 0.5, 43, "left"), n(12.5, 0.5, 55, "right"), n(13.0, 0.5, 59, "right"),
  n(13.5, 0.5, 62, "right"), n(14.0, 0.5, 65, "right"), n(14.5, 0.5, 62, "right"),
  n(15.0, 0.5, 59, "right"), n(15.5, 0.5, 55, "right"),
  // Bar 5: C/E (bass E2, arpeggio C4-E4-G4-C5-G4-E4-C4)
  n(16.0, 0.5, 40, "left"), n(16.5, 0.5, 60, "right"), n(17.0, 0.5, 64, "right"),
  n(17.5, 0.5, 67, "right"), n(18.0, 0.5, 72, "right"), n(18.5, 0.5, 67, "right"),
  n(19.0, 0.5, 64, "right"), n(19.5, 0.5, 60, "right"),
  // Bar 6: A minor (same as bar 2)
  n(20.0, 0.5, 45, "left"), n(20.5, 0.5, 57, "right"), n(21.0, 0.5, 60, "right"),
  n(21.5, 0.5, 64, "right"), n(22.0, 0.5, 69, "right"), n(22.5, 0.5, 64, "right"),
  n(23.0, 0.5, 60, "right"), n(23.5, 0.5, 57, "right"),
  // Bar 7: D/F# (bass F#2, arpeggio D3-F#3-A3-D4-A3-F#3-D3)
  n(24.0, 0.5, 42, "left"), n(24.5, 0.5, 50, "right"), n(25.0, 0.5, 54, "right"),
  n(25.5, 0.5, 57, "right"), n(26.0, 0.5, 62, "right"), n(26.5, 0.5, 57, "right"),
  n(27.0, 0.5, 54, "right"), n(27.5, 0.5, 50, "right"),
  // Bar 8: G major (bass G2, arpeggio G3-B3-D4-G4-D4-B3-G3)
  n(28.0, 0.5, 43, "left"), n(28.5, 0.5, 55, "right"), n(29.0, 0.5, 59, "right"),
  n(29.5, 0.5, 62, "right"), n(30.0, 0.5, 67, "right"), n(30.5, 0.5, 62, "right"),
  n(31.0, 0.5, 59, "right"), n(31.5, 0.5, 55, "right"),
];

export const BACH_PRELUDE_C: MusicalExercise = {
  kind: "musical",
  id: "bach-prelude-c",
  title: "Prelude in C Major, BWV 846 — Bach",
  description:
    "The opening of The Well-Tempered Clavier. One broken chord per bar — C, Am, Dm, G7, and beyond. Focus on an even, flowing rhythm.",
  level: "intermediate",
  tempo: 72,
  timeSignature: [4, 4],
  totalBeats: 32,
  notes: bachNotes,
};

// ── 2. Gymnopédie No. 1 — Erik Satie ─────────────────────────────────────────
// 8 bars, 3/4, 76 BPM. LH: bass (beat 1) + Dmaj7/Gmaj7 chord (beats 2–3).
// RH melody enters at bar 5. Key: D major (F#=54/66, C#=49/61/73).
const gymnoBar_D: MusicNote[] = [
  // LH: D2 bass (quarter), then F#3-A3-C#4 chord (half note)
  n(0, 1, 38, "left"),                                       // D2 bass
  n(1, 2, 54, "left"), n(1, 2, 57, "left"), n(1, 2, 61, "left"), // F#3, A3, C#4
];
const gymnoBar_G: MusicNote[] = [
  // LH: G2 bass (quarter), then B3-D4-F#4 chord (half note)
  n(0, 1, 43, "left"),                                       // G2 bass
  n(1, 2, 59, "left"), n(1, 2, 62, "left"), n(1, 2, 66, "left"), // B3, D4, F#4
];
const gymnoIntro: MusicNote[] = [
  ...rep(gymnoBar_D, 1, 3),       // bar 1 (Dmaj7)
  ...rep(gymnoBar_G, 1, 3).map(note => ({ ...note, beat: note.beat + 3 })), // bar 2 (Gmaj7)
  ...rep(gymnoBar_D, 1, 3).map(note => ({ ...note, beat: note.beat + 6 })), // bar 3
  ...rep(gymnoBar_G, 1, 3).map(note => ({ ...note, beat: note.beat + 9 })), // bar 4
];

// Melody bars 5–8 (beats 12–24): E4 pickup on beat 11, then flowing D major melody
const gymnoMelody: MusicNote[] = [
  n(11, 1, 64, "right"),  // E4 pickup (beat 3 of bar 4)
  // Bar 5 (Dmaj7 LH, beats 12–15):
  n(12, 1, 38, "left"), n(13, 2, 54, "left"), n(13, 2, 57, "left"), n(13, 2, 61, "left"),
  n(12, 3, 69, "right"),   // A4 dotted half
  // Bar 6 (Gmaj7 LH, beats 15–18):
  n(15, 1, 43, "left"), n(16, 2, 59, "left"), n(16, 2, 62, "left"), n(16, 2, 66, "left"),
  n(15, 1, 67, "right"),   // G4 quarter
  n(16, 2, 66, "right"),   // F#4 half
  // Bar 7 (Dmaj7 LH, beats 18–21):
  n(18, 1, 38, "left"), n(19, 2, 54, "left"), n(19, 2, 57, "left"), n(19, 2, 61, "left"),
  n(18, 3, 64, "right"),   // E4 dotted half
  // Bar 8 (Gmaj7 LH, beats 21–24):
  n(21, 1, 43, "left"), n(22, 2, 59, "left"), n(22, 2, 62, "left"), n(22, 2, 66, "left"),
  n(21, 3, 62, "right"),   // D4 dotted half
];

export const GYMNOPEDIE_1: MusicalExercise = {
  kind: "musical",
  id: "gymnopedie-1",
  title: "Gymnopédie No. 1 — Satie",
  description:
    "Satie's iconic slow waltz in D major. LH leaps from a low bass note to a Dmaj7/Gmaj7 chord; RH carries the floating melody. Play very softly.",
  level: "intermediate",
  tempo: 76,
  timeSignature: [3, 4],
  totalBeats: 24,
  notes: [...gymnoIntro, ...gymnoMelody],
};

// ── 3. Für Elise — Beethoven (A section) ─────────────────────────────────────
// 3/8 time encoded as quarter-note beats (each 8th = 0.5). Tempo 80 BPM quarter.
// Theme: E5-D#5-E5-D#5-E5-B4-D5-C5-A4 (9 eighth notes), then Am / E response.
const furEliseNotes: MusicNote[] = [
  // === Theme 1 (beats 0–5.5) ===
  n(0.0, 0.5, 76, "right"), // E5
  n(0.5, 0.5, 75, "right"), // D#5
  n(1.0, 0.5, 76, "right"), // E5
  n(1.5, 0.5, 75, "right"), // D#5
  n(2.0, 0.5, 76, "right"), // E5
  n(2.5, 0.5, 71, "right"), // B4
  n(3.0, 0.5, 74, "right"), // D5
  n(3.5, 0.5, 72, "right"), // C5
  n(4.0, 1.5, 69, "right"), // A4 (dotted quarter)
  // === Am response (beats 5.5–8) ===
  n(5.5, 1.5, 45, "left"),  // A2 bass
  n(5.5, 1.5, 52, "left"),  // E3 (Am 5th)
  n(6.0, 0.5, 60, "right"), // C4
  n(6.5, 0.5, 64, "right"), // E4
  n(7.0, 0.5, 69, "right"), // A4
  n(7.5, 0.5, 71, "right"), // B4
  // === E major (dominant of Am) (beats 8–10) ===
  n(8.0, 2.0, 40, "left"),  // E2
  n(8.0, 2.0, 47, "left"),  // B2
  n(8.0, 2.0, 52, "left"),  // E3
  n(8.5, 0.5, 64, "right"), // E4
  n(9.0, 0.5, 68, "right"), // G#4
  n(9.5, 0.5, 71, "right"), // B4
  // === Theme 2 (beats 10–15.5) ===
  n(10.0, 0.5, 76, "right"),
  n(10.5, 0.5, 75, "right"),
  n(11.0, 0.5, 76, "right"),
  n(11.5, 0.5, 75, "right"),
  n(12.0, 0.5, 76, "right"),
  n(12.5, 0.5, 71, "right"),
  n(13.0, 0.5, 74, "right"),
  n(13.5, 0.5, 72, "right"),
  n(14.0, 1.5, 69, "right"),
  // === Am response 2 (beats 15.5–18) ===
  n(15.5, 1.5, 45, "left"),
  n(15.5, 1.5, 52, "left"),
  n(16.0, 0.5, 60, "right"),
  n(16.5, 0.5, 64, "right"),
  n(17.0, 0.5, 69, "right"),
  n(17.5, 0.5, 71, "right"),
  // === E major 2 (beats 18–20) ===
  n(18.0, 2.0, 40, "left"),
  n(18.0, 2.0, 47, "left"),
  n(18.0, 2.0, 52, "left"),
  n(18.5, 0.5, 64, "right"),
  n(19.0, 0.5, 68, "right"),
  n(19.5, 0.5, 71, "right"),
  // === Final Am resolution (beat 20) ===
  n(20.0, 3.0, 45, "left"),
  n(20.0, 3.0, 52, "left"),
  n(20.0, 3.0, 57, "left"), // A3
  n(20.5, 0.5, 64, "right"),
  n(21.0, 1.5, 69, "right"),
];

export const FUR_ELISE: MusicalExercise = {
  kind: "musical",
  id: "fur-elise-full",
  title: "Für Elise — Beethoven",
  description:
    "The complete A section of Beethoven's most famous piece. The iconic E–D#–E motif, the Am response phrase, and the E major bridge — all leading back to the theme.",
  level: "intermediate",
  tempo: 80,
  timeSignature: [3, 8],
  totalBeats: 23,
  notes: furEliseNotes,
};

// ── 4. Moonlight Sonata, 1st Movement — Beethoven ────────────────────────────
// C# minor. The iconic triplet accompaniment pattern (RH) + bass (LH).
// 4 bars, 4/4, 54 BPM. Triplets: G#3(56)–C#4(61)–E4(64) cycling.
// C#2=37, G#2=44, G#1=32, C#1=25
const moonlightNotes: MusicNote[] = [
  // Bass (LH): C#2 bars 1–2, G#1 bars 3–4
  n(0, 8, 37, "left"),   // C#2 (bars 1–2)
  n(8, 8, 32, "left"),   // G#1 (bars 3–4)
  // Triplet arpeggio (RH): G#3–C#4–E4, 4 bars = 16 beats = 48 triplets
  ...triplets(0, 16, [56, 61, 64], "right"),
];

export const MOONLIGHT_SONATA: MusicalExercise = {
  kind: "musical",
  id: "moonlight-sonata",
  title: "Moonlight Sonata — Beethoven",
  description:
    "Beethoven's Adagio sostenuto in C# minor. LH holds the low bass; RH plays the relentless eighth-note triplets (G#–C#–E) that create the haunting mood.",
  level: "intermediate",
  tempo: 54,
  timeSignature: [4, 4],
  totalBeats: 16,
  notes: moonlightNotes,
};

// ── 5. Prelude in E Minor, Op. 28 No. 4 — Chopin ────────────────────────────
// E minor, 4/4, 60 BPM. LH: sustained 8th-note block chords (Em, chromatic descent).
// RH: very slow sustained melody descending through E minor.
// Em chord: E2(40), B2(47), G3(55). Chromatic bass: B→Bb→A→Ab.
const chopinEminorNotes: MusicNote[] = [
  // LH bar 1: Em — B2(47)+G3(55) on every 8th, E2(40) bass whole note
  n(0, 4, 40, "left"), // E2 bass (whole note, visual)
  ...chords8(0, 4, [47, 55], "left"), // B2+G3 on every 8th
  // LH bar 2: Bb2(46) replaces B2 (chromatic descent of 5th)
  n(4, 4, 40, "left"),
  ...chords8(4, 4, [46, 55], "left"),
  // LH bar 3: A2(45) continues descent
  n(8, 4, 40, "left"),
  ...chords8(8, 4, [45, 55], "left"),
  // LH bar 4: Ab2(44)+F#3(54) — inner voices shift too
  n(12, 4, 40, "left"),
  ...chords8(12, 4, [44, 54], "left"),
  // RH melody: slow descent B4→G4→A4→F#4→E4 (half notes)
  n(0, 2, 71, "right"),  // B4
  n(2, 2, 67, "right"),  // G4
  n(4, 2, 69, "right"),  // A4
  n(6, 2, 66, "right"),  // F#4
  n(8, 4, 64, "right"),  // E4 (whole note, tonic reached)
  n(12, 4, 64, "right"), // E4 (held — the long, mournful ending)
];

export const CHOPIN_PRELUDE_E_MINOR: MusicalExercise = {
  kind: "musical",
  id: "chopin-prelude-e-minor",
  title: "Prelude in E Minor, Op. 28 No. 4 — Chopin",
  description:
    "Chopin's most heart-breaking short piece. LH plays slow 8th-note chords with a chromatically descending inner voice; RH sings one long, mournful melody.",
  level: "intermediate",
  tempo: 60,
  timeSignature: [4, 4],
  totalBeats: 16,
  notes: chopinEminorNotes,
};

// ── 6. Waltz in A Minor, B. 150 — Chopin ─────────────────────────────────────
// A minor, 3/4, 138 BPM. LH: oom-pah-pah (A2 bass + Am/E7 chord).
// RH: sweeping melody ascending then descending through A minor.
// Am chord: C3(48)+E3(52). E7 chord: G#3(56)+D3(50) (3rd + 7th).
const chopinWaltzNotes: MusicNote[] = [
  // Bar 1: Am — A2(45) bass, C3+E3 chord (beats 2–3), RH melody ascending
  n(0, 1, 45, "left"), n(1, 2, 48, "left"), n(1, 2, 52, "left"),
  n(0, 1, 76, "right"), n(1, 1, 72, "right"), n(2, 1, 69, "right"), // E5-C5-A4 descend
  // Bar 2: E7 — E2(40) bass, G#3(56)+B3(59) chord, RH continues
  n(3, 1, 40, "left"), n(4, 2, 56, "left"), n(4, 2, 59, "left"),
  n(3, 1, 71, "right"), n(4, 1, 68, "right"), n(5, 1, 64, "right"), // B4-G#4-E4
  // Bar 3: Am again
  n(6, 1, 45, "left"), n(7, 2, 48, "left"), n(7, 2, 52, "left"),
  n(6, 1, 69, "right"), n(7, 1, 72, "right"), n(8, 1, 76, "right"), // A4-C5-E5 ascend
  // Bar 4: E7 → resolves to Am
  n(9, 1, 40, "left"), n(10, 2, 56, "left"), n(10, 2, 59, "left"),
  n(9, 1, 74, "right"), n(10, 1, 72, "right"), n(11, 1, 69, "right"), // D5-C5-A4
];

export const CHOPIN_WALTZ_A_MINOR: MusicalExercise = {
  kind: "musical",
  id: "chopin-waltz-a-minor",
  title: "Waltz in A Minor, B. 150 — Chopin",
  description:
    "An elegant waltz in A minor. LH uses the classic oom-pah-pah pattern between Am and E7; RH plays a sweeping melody across the A minor scale.",
  level: "intermediate",
  tempo: 138,
  timeSignature: [3, 4],
  totalBeats: 12,
  notes: chopinWaltzNotes,
};

// ── 7. River Flows in You — Yiruma ───────────────────────────────────────────
// A major, 4/4, 72 BPM. Chord progression: A – E/G# – F#m – D (repeating).
// LH: quarter-note broken arpeggios. RH: gentle melody.
// A2=45,E3=52,A3=57,C#4=61 | G#2=44,E3=52,G#3=56,B3=59 | F#2=42,C#3=49,F#3=54,A3=57 | D2=38,A2=45,D3=50,F#3=54
const riverNotes: MusicNote[] = [
  // Bar 1: A major LH arpeggio
  n(0, 1, 45, "left"), n(1, 1, 52, "left"), n(2, 1, 57, "left"), n(3, 1, 61, "left"),
  // Bar 2: E/G# LH arpeggio
  n(4, 1, 44, "left"), n(5, 1, 52, "left"), n(6, 1, 56, "left"), n(7, 1, 59, "left"),
  // Bar 3: F#m LH arpeggio
  n(8, 1, 42, "left"), n(9, 1, 49, "left"), n(10, 1, 54, "left"), n(11, 1, 57, "left"),
  // Bar 4: D major LH arpeggio
  n(12, 1, 38, "left"), n(13, 1, 45, "left"), n(14, 1, 50, "left"), n(15, 1, 54, "left"),
  // RH melody — gentle A major phrases
  n(0, 2, 69, "right"),  // A4 half (bar 1)
  n(2, 2, 73, "right"),  // C#5 half
  n(4, 2, 76, "right"),  // E5 half (bar 2)
  n(6, 2, 73, "right"),  // C#5 half
  n(8, 2, 69, "right"),  // A4 half (bar 3)
  n(10, 2, 66, "right"), // F#4 half
  n(12, 2, 62, "right"), // D4 half (bar 4)
  n(14, 2, 69, "right"), // A4 half
];

export const RIVER_FLOWS_IN_YOU: MusicalExercise = {
  kind: "musical",
  id: "river-flows-in-you",
  title: "River Flows in You — Yiruma",
  description:
    "The most-requested modern piano song. LH rolls through an A–E–F#m–D chord cycle; RH carries a gentle, flowing melody through A major.",
  level: "intermediate",
  tempo: 72,
  timeSignature: [4, 4],
  totalBeats: 16,
  notes: riverNotes,
};

// ── 8. Träumerei (Dreaming) — Schumann ───────────────────────────────────────
// F major, 4/4, 56 BPM. Deeply legato melody over gentle chords.
// F major: F4=65, G4=67, A4=69, Bb4=70, C5=72, D5=74, E5=76
// LH: F major / C7 chords. RH: lyrical melody.
const traumereiNotes: MusicNote[] = [
  // Bar 1: F major (F2=41 bass, A3=57+C4=60 chord)
  n(0, 4, 41, "left"), n(0, 4, 57, "left"), n(0, 4, 60, "left"),
  // Bar 2: C7 (C2=36, E3=52+G3=55+Bb3=58)
  n(4, 4, 36, "left"), n(4, 4, 52, "left"), n(4, 4, 55, "left"), n(4, 4, 58, "left"),
  // Bar 3: F major
  n(8, 4, 41, "left"), n(8, 4, 57, "left"), n(8, 4, 60, "left"),
  // Bar 4: C7 → F
  n(12, 2, 36, "left"), n(12, 2, 52, "left"), n(12, 2, 55, "left"),
  n(14, 2, 41, "left"), n(14, 2, 57, "left"), n(14, 2, 60, "left"),
  // RH melody: C5→F5→E5→D5→C5→A4→Bb4→A4→G4→F4 (flowing in F major)
  n(0, 1, 72, "right"),  // C5
  n(1, 1, 77, "right"),  // F5
  n(2, 1, 76, "right"),  // E5
  n(3, 1, 74, "right"),  // D5
  n(4, 1, 72, "right"),  // C5
  n(5, 1, 69, "right"),  // A4
  n(6, 2, 70, "right"),  // Bb4 half
  n(8, 1, 69, "right"),  // A4
  n(9, 1, 67, "right"),  // G4
  n(10, 2, 65, "right"), // F4 half
  n(12, 2, 72, "right"), // C5
  n(14, 2, 65, "right"), // F4
];

export const TRAUMEREI: MusicalExercise = {
  kind: "musical",
  id: "traumerei",
  title: "Träumerei — Schumann",
  description:
    "Schumann's 'Dreaming' from Kinderszenen. A tender F major melody that requires a singing legato touch and careful balance between the two hands.",
  level: "intermediate",
  tempo: 56,
  timeSignature: [4, 4],
  totalBeats: 16,
  notes: traumereiNotes,
};

// ── 9. To a Wild Rose — MacDowell ────────────────────────────────────────────
// D major, 4/4, 66 BPM. Soft, simple, cantabile melody over gentle D major harmony.
// D major: D4=62,E4=64,F#4=66,G4=67,A4=69,B4=71,C#5=73,D5=74
// LH: D major / G major / A7 chords. RH: gentle melody.
const wildRoseNotes: MusicNote[] = [
  // Bar 1: D major (D2=38, F#3=54+A3=57)
  n(0, 4, 38, "left"), n(0, 4, 54, "left"), n(0, 4, 57, "left"),
  // Bar 2: G major (G2=43, B3=59+D4=62)
  n(4, 4, 43, "left"), n(4, 4, 59, "left"), n(4, 4, 62, "left"),
  // Bar 3: D major
  n(8, 4, 38, "left"), n(8, 4, 54, "left"), n(8, 4, 57, "left"),
  // Bar 4: A7 → D (A2=45, C#4=61+E4=64)
  n(12, 2, 45, "left"), n(12, 2, 61, "left"), n(12, 2, 64, "left"),
  n(14, 2, 38, "left"), n(14, 2, 54, "left"), n(14, 2, 57, "left"),
  // RH melody — a sweet D major phrase
  n(0, 2, 69, "right"),  // A4 half
  n(2, 2, 71, "right"),  // B4 half
  n(4, 4, 74, "right"),  // D5 whole
  n(8, 2, 73, "right"),  // C#5 half
  n(10, 2, 71, "right"), // B4 half
  n(12, 4, 69, "right"), // A4 whole (final phrase)
];

export const TO_A_WILD_ROSE: MusicalExercise = {
  kind: "musical",
  id: "to-a-wild-rose",
  title: "To a Wild Rose — MacDowell",
  description:
    "MacDowell's tender miniature in D major. Develops a soft, singing tone and gentle dynamic shading. Simple harmonies, deeply expressive.",
  level: "intermediate",
  tempo: 66,
  timeSignature: [4, 4],
  totalBeats: 16,
  notes: wildRoseNotes,
};

// ── 10. Nuvole Bianche — Einaudi ─────────────────────────────────────────────
// G major, 6/4, 76 BPM (6 quarter beats per bar).
// LH: rolling ascending arpeggio through the chord. RH: slow syncopated melody.
// G major: G2=43,D3=50,G3=55,B3=59,D4=62,G4=67 | Em: E2=40,B2=47,E3=52,G3=55,B3=59,E4=64
const nuvolaNotes: MusicNote[] = [
  // Bar 1: G major (G2-D3-G3-B3-D4-G4, six quarter notes)
  n(0, 1, 43, "left"), n(1, 1, 50, "left"), n(2, 1, 55, "left"),
  n(3, 1, 59, "left"), n(4, 1, 62, "left"), n(5, 1, 67, "left"),
  // Bar 2: D major (D2=38-A2=45-D3=50-F#3=54-A3=57-D4=62)
  n(6, 1, 38, "left"), n(7, 1, 45, "left"), n(8, 1, 50, "left"),
  n(9, 1, 54, "left"), n(10, 1, 57, "left"), n(11, 1, 62, "left"),
  // Bar 3: Em (E2=40-B2=47-E3=52-G3=55-B3=59-E4=64)
  n(12, 1, 40, "left"), n(13, 1, 47, "left"), n(14, 1, 52, "left"),
  n(15, 1, 55, "left"), n(16, 1, 59, "left"), n(17, 1, 64, "left"),
  // Bar 4: C major (C2=36-G2=43-C3=48-E3=52-G3=55-C4=60)
  n(18, 1, 36, "left"), n(19, 1, 43, "left"), n(20, 1, 48, "left"),
  n(21, 1, 52, "left"), n(22, 1, 55, "left"), n(23, 1, 60, "left"),
  // RH melody — slow, entering mid-bar (Einaudi's syncopated style)
  n(2, 4, 71, "right"),  // B4 (enters on beat 3 of bar 1, held into bar 2)
  n(6, 6, 69, "right"),  // A4 (whole bar 2)
  n(12, 4, 67, "right"), // G4 (enters beat 1 of bar 3, held)
  n(16, 2, 64, "right"), // E4 (last 2 beats of bar 3)
  n(18, 6, 71, "right"), // B4 (whole bar 4)
];

export const NUVOLE_BIANCHE: MusicalExercise = {
  kind: "musical",
  id: "nuvole-bianche",
  title: "Nuvole Bianche — Einaudi",
  description:
    "Einaudi's modern masterpiece in G major. LH rolls through continuous arpeggios (G–D–Em–C); RH enters mid-bar with a syncopated, floating melody.",
  level: "intermediate",
  tempo: 76,
  timeSignature: [6, 4],
  totalBeats: 24,
  notes: nuvolaNotes,
};

// ── All musical pieces ────────────────────────────────────────────────────────
export const MUSICAL_PIECES: MusicalExercise[] = [
  BACH_PRELUDE_C,
  GYMNOPEDIE_1,
  FUR_ELISE,
  MOONLIGHT_SONATA,
  CHOPIN_PRELUDE_E_MINOR,
  CHOPIN_WALTZ_A_MINOR,
  RIVER_FLOWS_IN_YOU,
  TRAUMEREI,
  TO_A_WILD_ROSE,
  NUVOLE_BIANCHE,
];
