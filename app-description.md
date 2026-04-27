Below is a **copy-pasteable product + technical specification** for an AI coder.

---

# AI Piano Tutor App — Product & Engineering Specification

## 1. Product Vision

Build a mobile-first piano learning application that acts like a personalized AI piano teacher. The app listens to or receives the user’s piano playing, understands what they played, compares it to the intended exercise or piece, and gives real-time and post-practice feedback. The tutor should teach piano basics, music theory, technique, rhythm, sight-reading, repertoire, and daily practice discipline.

The app should feel less like a static course and more like a patient human tutor who remembers the student, adapts to their weaknesses, talks with them, motivates them, and gives them a clear daily path.

---

## 2. Core Concept

The user opens the app and can:

1. Connect an electric piano through MIDI, Bluetooth MIDI, or USB MIDI.
2. Use the phone microphone as a fallback when MIDI is unavailable.
3. Choose a goal: learn basics, practice a piece, learn theory, sight-read, improve rhythm, etc.
4. Talk to an AI tutor by voice or text.
5. Play exercises or pieces while the app recognizes notes in real time.
6. Receive instant feedback:

   * wrong notes
   * missed notes
   * rhythm mistakes
   * tempo issues
   * hand coordination
   * dynamics
   * consistency
   * repeated weak spots
7. Receive a personalized daily practice plan.

The best technical path is to treat **MIDI input as the main input source**, because MIDI gives direct note-on, note-off, velocity, timing, and pedal data. Microphone-based recognition should be supported, but as a secondary path, because piano transcription from raw audio is harder and more error-prone. Web MIDI is available through `navigator.requestMIDIAccess()`, but MDN marks Web MIDI as limited availability and requiring secure contexts, so a serious mobile app should use native MIDI support where possible. Apple Core MIDI supports MIDI device communication and BLE MIDI, and Android’s MIDI APIs support USB, Bluetooth LE, and virtual MIDI transports. ([MDN Web Docs][1])

---

# 3. Target Platforms

## Primary Platform

Build a **mobile app first**:

* iOS
* Android

Recommended stack:

* React Native with Expo Dev Client or bare React Native
* Native modules for MIDI:

  * iOS: Core MIDI
  * Android: `android.media.midi`
* Backend:

  * FastAPI, Node.js/NestJS, or similar
* Database:

  * PostgreSQL
* Realtime:

  * WebSocket or WebRTC data channel for practice sessions
* AI:

  * LLM-based tutor orchestration
  * Speech-to-text
  * Text-to-speech
  * Music-analysis engine separate from the LLM

## Secondary Platform

Optional web/desktop version:

* Next.js / React
* Web MIDI API for browser MIDI input
* Web Audio API for microphone input

For browser audio, use `getUserMedia()` to request microphone permission and Web Audio / AudioWorklet for low-latency processing. MDN describes Web Audio as a system for audio processing and AudioWorklet as running audio processing in a separate thread for low latency. ([MDN Web Docs][2])

---

# 4. Product Philosophy

The app should not just say “wrong note.” It should behave like a real teacher.

A good tutor should:

* understand the student’s current level
* set realistic goals
* explain theory only when useful
* break pieces into small sections
* notice repeated mistakes
* give encouraging but honest feedback
* adapt the next lesson based on today’s performance
* remember the user’s progress over weeks and months
* speak naturally
* avoid overwhelming the user
* create a feeling of daily progress

The app should optimize for **consistent improvement**, not only gamification.

---

# 5. Main User Personas

## Beginner

The beginner wants to learn piano from zero.

Needs:

* note names
* hand position
* basic rhythm
* simple melodies
* reading treble and bass clef
* simple chords
* daily guided practice
* motivation

## Returning Player

The returning player played piano before but is rusty.

Needs:

* skill assessment
* targeted review
* repertoire suggestions
* technique repair
* theory refresh
* flexible practice plans

## Self-Learner

The self-learner does not have a human teacher.

Needs:

* structured curriculum
* explanations
* mistake detection
* accountability
* feedback on pieces
* answers to theory questions

## Serious Learner

The serious learner wants measurable progress.

Needs:

* detailed analytics
* tempo curves
* accuracy tracking
* section-by-section practice
* fingering suggestions
* musicality feedback
* long-term practice history

---

# 6. MVP Feature Set

The MVP should be focused but impressive.

## MVP Must-Haves

### 1. User Onboarding

The app should ask:

* What is your piano level?
* Do you read sheet music?
* Do you own an electric piano?
* Can your piano connect through USB or Bluetooth MIDI?
* What are your goals?

  * learn from zero
  * learn songs
  * learn classical pieces
  * learn music theory
  * improve technique
  * improve rhythm
  * prepare for lessons/exams
* How many minutes can you practice daily?
* Preferred tutor style:

  * gentle
  * strict
  * funny
  * analytical
  * motivating

### 2. Instrument Connection

Support input modes:

1. MIDI over USB
2. Bluetooth MIDI
3. Web MIDI for web/desktop version
4. Microphone listening fallback
5. On-screen piano keyboard for testing

The app should show connection quality:

* connected device name
* MIDI latency estimate
* last note received
* pedal status
* velocity detection
* warning if microphone mode is noisy

### 3. Real-Time Note Recognition

For MIDI:

* capture note-on events
* capture note-off events
* capture velocity
* capture sustain pedal
* timestamp all events using a monotonic clock
* normalize to internal `NoteEvent`

For microphone:

* capture audio stream
* estimate pitch/onsets
* convert to probable note events
* show confidence score
* do not treat microphone recognition as equally reliable as MIDI

Magenta’s Onsets and Frames is an example of an ML-based piano transcription approach for converting raw audio to MIDI-like notes, but this should be treated as a model/reference path rather than the only implementation. ([npm][3])

### 4. Practice Mode

The app should allow the user to practice:

* single notes
* intervals
* scales
* chords
* rhythm exercises
* simple melodies
* beginner pieces
* uploaded/imported pieces later

The app should compare what the user played against the expected score.

Track:

* correct notes
* wrong notes
* missed notes
* early notes
* late notes
* held too short
* held too long
* tempo drift
* pauses
* repeated problem bars

### 5. AI Tutor Chat

The user should be able to talk to the tutor by text and voice.

Examples:

* “What did I do wrong?”
* “Can you explain this rhythm?”
* “Make today’s practice easier.”
* “I keep missing the left hand.”
* “Teach me what a major scale is.”
* “Give me a 20-minute practice plan.”
* “Can we repeat bar 4 slowly?”

The AI should use actual practice data, not generic advice.

Bad answer:

> “Practice slowly and focus on accuracy.”

Good answer:

> “You played the right-hand notes correctly, but your left hand entered about 300 ms late in bars 3 and 4. Let’s isolate only the left hand for 2 minutes at 60 BPM, then add the right hand back.”

### 6. Daily Practice Plan

Every day, the app should generate a personalized plan.

Example:

```text
Today’s 25-minute plan:

1. Warm-up: C major five-finger pattern — 4 minutes
2. Rhythm drill: quarter notes and half notes — 5 minutes
3. Piece practice: Ode to Joy, bars 1–4 — 10 minutes
4. Theory: identify C, D, E, F, G on treble clef — 4 minutes
5. Reflection: listen to your best attempt — 2 minutes
```

### 7. Post-Practice Review

After each session, show:

* overall score
* pitch accuracy
* rhythm accuracy
* tempo stability
* most difficult measure
* best improvement
* suggested next step
* AI tutor summary

Example:

```text
Great work today. Your note accuracy improved from 71% to 84%.
Your main issue is rhythm: you often rush the second half of the phrase.
Tomorrow we will keep the same notes but practice with a slower metronome.
```

---

# 7. Advanced Feature Set

## 7.1 Personalized AI Tutor Memory

The tutor should remember:

* user’s level
* goals
* favorite music styles
* pieces learned
* pieces abandoned
* recurring mistakes
* daily practice consistency
* preferred explanations
* emotional/motivational preferences
* theory topics already understood
* tempo ceilings for pieces
* weak note-reading areas
* left-hand/right-hand imbalance

Create two types of memory:

### Long-Term Memory

Stable facts:

```json
{
  "user_level": "beginner",
  "goal": "learn classical piano basics",
  "preferred_tutor_style": "encouraging but honest",
  "practice_time_preference": "20 minutes per day",
  "reads_sheet_music": false,
  "instrument_type": "digital piano with Bluetooth MIDI"
}
```

### Performance Memory

Practice-derived facts:

```json
{
  "common_mistakes": [
    "rushes eighth notes",
    "misses bass clef notes below C3",
    "left hand enters late"
  ],
  "strong_areas": [
    "right-hand melody accuracy",
    "consistent daily practice"
  ],
  "current_piece": "Ode to Joy",
  "current_piece_progress": {
    "bars_1_4": "stable at 70 BPM",
    "bars_5_8": "needs hands-separate practice"
  }
}
```

The tutor should not blindly store everything. It should store only information useful for future teaching.

---

## 7.2 Adaptive Curriculum

The app should maintain a skill tree.

Example skill areas:

```text
Technique
- posture
- hand position
- finger numbers
- five-finger patterns
- scales
- chords
- arpeggios

Reading
- treble clef notes
- bass clef notes
- ledger lines
- intervals
- key signatures
- time signatures

Rhythm
- quarter notes
- half notes
- whole notes
- eighth notes
- rests
- dotted rhythms
- syncopation

Theory
- major/minor scales
- intervals
- triads
- chord progressions
- cadences
- Roman numerals

Repertoire
- beginner melodies
- classical beginner pieces
- pop chord songs
- sight-reading miniatures

Ear Training
- recognize high/low
- intervals
- major/minor
- rhythm imitation
- melody playback
```

Each skill should have:

```json
{
  "skill_id": "rhythm.quarter_half_notes",
  "name": "Quarter and half notes",
  "status": "learning",
  "mastery_score": 0.64,
  "last_practiced": "2026-04-27",
  "evidence": [
    "completed rhythm drill 3 times",
    "average timing error 180 ms",
    "still rushes half notes"
  ]
}
```

Mastery should update from real performance, not only from finishing lessons.

---

## 7.3 Piece Learning System

The app should support learning pieces in sections.

For each piece:

* title
* composer/artist
* difficulty level
* key
* time signature
* tempo
* measures
* right-hand part
* left-hand part
* fingerings
* theory concepts used
* practice sections

The app should let the user practice:

* right hand only
* left hand only
* both hands
* one bar
* two-bar loop
* phrase loop
* slow tempo
* metronome
* no metronome
* performance mode

The app should automatically identify the weakest section and suggest it.

Example:

```text
You can play bars 1–2 well at 80 BPM, but bars 3–4 drop to 52% rhythm accuracy.
Let’s loop bars 3–4 at 55 BPM, left hand only.
```

---

## 7.4 Real-Time Feedback Modes

Support different feedback styles.

### Silent Mode

The app records and analyzes without interrupting.

### Live Visual Mode

The app highlights:

* green: correct
* red: wrong
* yellow: late/early
* gray: missed

### Tutor Interrupt Mode

The tutor may stop the user when something is seriously wrong.

Example:

```text
Pause. You are playing F instead of F-sharp. Look at the key signature: this piece is in G major.
```

### Call-and-Response Mode

The tutor plays or shows a phrase, then the user repeats it.

### Slow Practice Mode

The app waits for correct notes before moving forward.

### Rhythm Lock Mode

The app focuses only on timing, not pitch.

---

# 8. Technical Architecture

## 8.1 Recommended Architecture

```text
Mobile App
│
├── Input Layer
│   ├── MIDI Input
│   ├── BLE MIDI Input
│   ├── USB MIDI Input
│   ├── Microphone Input
│   └── On-Screen Keyboard Input
│
├── Practice Engine
│   ├── Note Normalization
│   ├── Latency Calibration
│   ├── Score Parser
│   ├── Note Matching
│   ├── Rhythm Analysis
│   ├── Mistake Detection
│   └── Feedback Generator
│
├── Tutor Layer
│   ├── AI Chat
│   ├── Voice Conversation
│   ├── Lesson Planner
│   ├── Memory Manager
│   └── Explanation Generator
│
├── UI Layer
│   ├── Home
│   ├── Connect Instrument
│   ├── Daily Plan
│   ├── Practice View
│   ├── Theory Lessons
│   ├── Progress Dashboard
│   └── Tutor Chat
│
└── Backend
    ├── Auth
    ├── User Profile
    ├── Practice Sessions
    ├── Scores/Pieces
    ├── AI Orchestration
    ├── Analytics
    └── Storage
```

---

# 9. Core Data Model

## User

```ts
type User = {
  id: string;
  name: string;
  createdAt: string;
  timezone: string;
  preferredLanguage: string;
  level: "absolute_beginner" | "beginner" | "intermediate" | "advanced";
  dailyPracticeMinutes: number;
  goals: string[];
  tutorStyle: "gentle" | "strict" | "funny" | "analytical" | "motivating";
};
```

## Instrument

```ts
type Instrument = {
  id: string;
  userId: string;
  name: string;
  type: "digital_piano" | "keyboard" | "acoustic_piano" | "unknown";
  inputModes: Array<"usb_midi" | "ble_midi" | "microphone" | "onscreen">;
  preferredInputMode: "usb_midi" | "ble_midi" | "microphone" | "onscreen";
  midiDeviceName?: string;
  averageLatencyMs?: number;
};
```

## Note Event

All input sources should be normalized into this format:

```ts
type NoteEvent = {
  id: string;
  source: "midi" | "microphone" | "onscreen";
  noteNumber: number;       // MIDI note number, e.g. middle C = 60
  noteName: string;         // C4, D#4, etc.
  frequencyHz?: number;
  velocity?: number;        // 0-127 for MIDI
  startedAtMs: number;
  endedAtMs?: number;
  durationMs?: number;
  confidence: number;       // 1.0 for MIDI, lower for microphone
  hand?: "left" | "right" | "unknown";
};
```

## Score Note

```ts
type ScoreNote = {
  id: string;
  pieceId: string;
  measureNumber: number;
  beat: number;
  expectedNoteNumber: number;
  expectedStartMs: number;
  expectedDurationMs: number;
  hand: "left" | "right";
  fingering?: number;
  dynamic?: "pp" | "p" | "mp" | "mf" | "f" | "ff";
};
```

## Practice Session

```ts
type PracticeSession = {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  mode: "lesson" | "piece" | "theory" | "sight_reading" | "free_play";
  pieceId?: string;
  skillIds: string[];
  inputMode: "midi" | "microphone" | "onscreen";
  summary?: PracticeSummary;
};
```

## Practice Summary

```ts
type PracticeSummary = {
  pitchAccuracy: number;
  rhythmAccuracy: number;
  tempoStability: number;
  averageTimingErrorMs: number;
  wrongNotes: number;
  missedNotes: number;
  earlyNotes: number;
  lateNotes: number;
  bestSection?: string;
  weakestSection?: string;
  aiFeedback: string;
  recommendedNextAction: string;
};
```

---

# 10. Note Matching Algorithm

The practice engine should compare expected notes against performed notes.

## Matching Rules

For each expected note:

1. Search for a performed note with the same MIDI note number.
2. Limit search to a timing window around the expected start.
3. Choose the closest note onset.
4. Mark result:

   * correct
   * wrong pitch
   * missed
   * early
   * late
   * too short
   * too long

## Timing Tolerance

Tolerance should depend on level and tempo.

Example:

```ts
const beginnerTimingToleranceMs = 350;
const intermediateTimingToleranceMs = 180;
const advancedTimingToleranceMs = 90;
```

## Result Format

```ts
type NoteMatchResult = {
  expectedNoteId: string;
  performedNoteId?: string;
  result:
    | "correct"
    | "wrong_pitch"
    | "missed"
    | "early"
    | "late"
    | "too_short"
    | "too_long";
  timingErrorMs?: number;
  pitchErrorSemitones?: number;
  feedbackMessage?: string;
};
```

## Section Analysis

Group results by:

* measure
* phrase
* hand
* skill
* note type
* rhythm pattern

Example output:

```json
{
  "weakest_measure": 4,
  "main_issue": "left hand timing",
  "recommendation": "Practice left hand only, bars 3-4, at 60 BPM"
}
```

---

# 11. AI Tutor Design

The AI tutor should not directly analyze raw note streams. Instead:

1. The practice engine analyzes performance.
2. The tutor receives structured analysis.
3. The tutor explains the analysis in human language.
4. The tutor chooses the next exercise.

## Tutor Input Example

```json
{
  "user": {
    "level": "beginner",
    "goal": "learn classical basics",
    "tutorStyle": "encouraging but honest"
  },
  "session": {
    "piece": "Ode to Joy",
    "section": "bars 1-4",
    "tempo": 70,
    "attempts": 5
  },
  "analysis": {
    "pitchAccuracy": 0.84,
    "rhythmAccuracy": 0.61,
    "averageTimingErrorMs": 280,
    "weakestMeasure": 3,
    "mainIssues": [
      "left hand enters late",
      "quarter notes become uneven",
      "missed G3 twice"
    ]
  }
}
```

## Tutor Output Example

```json
{
  "spokenFeedback": "Good progress. Your notes are mostly correct now, but the rhythm is still unstable. The left hand is entering late in bar 3, so we will isolate that hand.",
  "nextExercise": {
    "type": "loop_section",
    "piece": "Ode to Joy",
    "bars": [3, 4],
    "hand": "left",
    "tempo": 55,
    "durationMinutes": 3
  },
  "encouragement": "This is exactly how real practice works: first accuracy, then rhythm, then speed."
}
```

---

# 12. AI Tutor System Prompt

Use something like this as the tutor’s system prompt:

```text
You are an expert piano tutor inside an interactive piano-learning app.

Your job is to help the user improve at piano through clear explanations, structured practice, encouragement, and precise feedback based on their real playing data.

You must:
- adapt to the user’s level
- be kind but honest
- avoid overwhelming beginners
- explain musical concepts simply
- use the user’s practice history when available
- give specific next actions
- prioritize slow, accurate practice over speed
- identify patterns in mistakes
- ask the user to play short exercises when useful
- celebrate measurable improvement
- never pretend to hear something unless practice data was provided
- distinguish between MIDI-confirmed data and microphone-estimated data
- keep feedback concise during practice and more detailed after practice

When the user makes mistakes:
- explain what happened
- explain why it matters musically
- give a small exercise to fix it
- tell the user exactly what to do next

When teaching theory:
- connect theory to the keyboard
- include examples the user can play
- avoid abstract explanations unless the user asks for depth

When creating a practice plan:
- consider the user’s goal, available time, current skill level, recent mistakes, and current piece
- include warm-up, focused practice, theory or reading, and review
- keep the plan realistic

Your teaching style should match the user’s preference:
- gentle: soft, encouraging
- strict: direct, disciplined
- funny: playful but still useful
- analytical: detailed and data-driven
- motivating: energetic and progress-focused
```

---

# 13. Main App Screens

## 13.1 Home Screen

Show:

* greeting from tutor
* today’s practice plan
* current streak
* current piece
* next recommended action
* button: “Start Practice”
* button: “Talk to Tutor”
* button: “Connect Piano”

Example:

```text
Hi Attila. Today we’ll work on smoother rhythm in your left hand.
Recommended: 20 minutes
Main focus: Ode to Joy, bars 3–4
```

## 13.2 Connect Piano Screen

Show:

* available MIDI devices
* Bluetooth MIDI scan
* USB MIDI status
* microphone fallback
* latency test
* play-any-key test

The connection test should say:

```text
Play middle C.
Detected: C4
Input: Bluetooth MIDI
Latency: 24 ms
Velocity detected: yes
Pedal detected: yes
```

## 13.3 Practice Screen

Display:

* sheet music or simplified note lane
* metronome
* tempo control
* hand selector
* section selector
* real-time note feedback
* tutor message
* record/retry button

Modes:

* normal practice
* slow practice
* loop section
* hands separate
* performance mode

## 13.4 Tutor Chat Screen

Support:

* text chat
* voice chat
* “explain my last mistake”
* “make me a plan”
* “teach me theory”
* “quiz me”
* “listen to me play”

## 13.5 Theory Screen

Interactive lessons:

* notes on keyboard
* staff reading
* intervals
* scales
* chords
* rhythm
* key signatures
* simple harmony

Every theory lesson should include a playable exercise.

## 13.6 Progress Screen

Show:

* practice streak
* minutes practiced
* accuracy over time
* rhythm improvement
* pieces learned
* skills mastered
* weak skills
* tutor recommendations

---

# 14. Practice Modes in Detail

## Free Play Mode

The user plays anything.

The app should:

* show detected notes
* identify rough key center
* identify chords when possible
* show played note history
* allow the user to ask, “What did I just play?”

## Guided Lesson Mode

The tutor gives a sequence of tasks.

Example:

```text
1. Play C with your right thumb.
2. Now play D with finger 2.
3. Now play C-D-E-D-C slowly.
4. Great. Now keep the rhythm steady.
```

## Piece Practice Mode

The user practices a specific piece.

Features:

* select bars
* loop bars
* right hand / left hand / both
* adjustable tempo
* metronome
* auto-slowdown on repeated mistakes
* phrase-level goals

## Sight-Reading Mode

The app shows short unknown exercises.

Rules:

* user gets a few seconds to look
* then plays
* app scores accuracy and rhythm
* tutor gives one focused tip

## Ear Training Mode

The app plays:

* a note
* interval
* rhythm
* short melody

The user repeats it on piano.

## Theory-to-Keyboard Mode

Teach theory through playing.

Example:

```text
Theory: A major triad is built from the 1st, 3rd, and 5th notes of a major scale.
Now play C-E-G.
```

---

# 15. Feedback System

Feedback should be layered.

## Immediate Feedback

During playing:

* “Try that note again.”
* “Too early.”
* “Good.”
* “Left hand late.”
* “Check the F-sharp.”

## End-of-Attempt Feedback

After one attempt:

```text
You got 14 of 16 notes correct.
Your rhythm was weakest in bar 3.
Try again at 60 BPM.
```

## End-of-Session Feedback

After the full practice:

```text
You practiced for 22 minutes.
Your pitch accuracy improved from 76% to 88%.
Your rhythm accuracy is still at 63%, so tomorrow we will focus on slower metronome work.
```

## Weekly Feedback

Every week:

```text
This week you practiced 5 days.
Your biggest improvement was note reading.
Your main challenge is left-hand timing.
Next week’s goal: play Ode to Joy bars 1–8 at 75 BPM with 85% rhythm accuracy.
```

---

# 16. Gamification

Gamification should support learning, not distract from it.

Good gamification:

* streaks
* weekly goals
* skill mastery
* piece completion
* practice consistency
* personal best tempo
* badges for meaningful milestones

Avoid:

* rewarding speed over accuracy
* making users grind useless exercises
* hiding real feedback behind vague scores

Example badges:

```text
First 7-Day Streak
First Piece Completed
Rhythm Level 1
Treble Clef Reader
Left Hand Improved
Slow Practice Hero
```

---

# 17. AI Personalization Rules

The AI should personalize based on:

* user’s level
* practice frequency
* accuracy trends
* mistake patterns
* preferred learning style
* musical interests
* available daily time
* frustration level
* current goal

Example personalization:

```text
User has only 10 minutes today:
- skip long theory explanation
- choose one small exercise
- preserve streak
- end with encouragement
```

```text
User repeatedly misses bass clef:
- add daily 3-minute bass clef reading drill
- use keyboard mapping
- avoid introducing new complex theory
```

```text
User likes classical music:
- recommend beginner classical melodies
- explain phrasing and dynamics earlier
```

---

# 18. Lesson Content Requirements

Each lesson should have:

```ts
type Lesson = {
  id: string;
  title: string;
  level: string;
  estimatedMinutes: number;
  objective: string;
  explanation: string;
  demonstration?: string;
  exercises: Exercise[];
  successCriteria: string;
  nextLessonIds: string[];
};
```

Example lesson:

```json
{
  "id": "lesson.middle_c",
  "title": "Finding Middle C",
  "level": "absolute_beginner",
  "estimatedMinutes": 5,
  "objective": "The user can find and play middle C.",
  "explanation": "Middle C is the C near the center of the piano. It sits just to the left of a group of two black keys.",
  "exercises": [
    {
      "type": "play_note",
      "targetNote": "C4",
      "repetitions": 5
    }
  ],
  "successCriteria": "User plays C4 correctly 4 out of 5 times."
}
```

---

# 19. Music Theory Features

The theory system should teach:

## Beginner Theory

* keyboard layout
* note names
* octaves
* half steps and whole steps
* rhythm values
* time signatures
* treble clef
* bass clef
* sharps and flats
* major scale
* minor scale
* simple triads

## Intermediate Theory

* key signatures
* chord inversions
* seventh chords
* cadences
* Roman numerals
* chord progressions
* phrase structure
* modulation basics

## Interactive Theory Examples

Do not only show text. Make the user play.

Example:

```text
Tutor: A C major chord uses C, E, and G.
Task: Play C-E-G together.
App: Detected C-E-G.
Tutor: Correct. That is a root-position C major triad.
```

---

# 20. Repertoire System

The app should include beginner-friendly public-domain pieces and exercises.

For each piece:

* simplified version
* normal version
* right-hand only version
* left-hand only version
* theory notes
* practice sections
* target tempos
* difficulty rating

Example difficulty model:

```json
{
  "pieceId": "ode_to_joy_beginner",
  "difficulty": 1,
  "requiredSkills": [
    "right_hand_five_finger",
    "quarter_notes",
    "stepwise_motion"
  ],
  "challengeSkills": [
    "steady_tempo",
    "phrase_shape"
  ]
}
```

---

# 21. Microphone Recognition Fallback

Microphone mode should be designed carefully.

## Requirements

* ask for microphone permission
* show noise level
* recommend quiet room
* calibrate piano pitch
* detect acoustic vs digital piano
* show recognition confidence
* avoid harsh feedback when confidence is low

## Microphone Feedback Policy

If confidence is low, the tutor should say:

```text
I’m not fully confident because the microphone signal is noisy. I think you may have played F instead of E, but let’s try again slowly.
```

Never say with certainty that the user played a wrong note if the audio model is uncertain.

---

# 22. MIDI Requirements

Support:

* note on
* note off
* velocity
* sustain pedal
* device connection/disconnection
* latency calibration
* multiple connected devices
* error handling

Future-proofing:

* design the internal MIDI layer so MIDI 2.0 / Universal MIDI Packet support can be added later. MIDI Association documentation describes UMP as a common container able to carry MIDI 1.0 and MIDI 2.0 messages. ([MIDI.org][4])

Internal abstraction:

```ts
interface PianoInputProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onNoteStart(callback: (event: NoteEvent) => void): void;
  onNoteEnd(callback: (event: NoteEvent) => void): void;
  onPedalChange(callback: (event: PedalEvent) => void): void;
  getStatus(): InputStatus;
}
```

---

# 23. Backend API

## Auth

```http
POST /auth/signup
POST /auth/login
POST /auth/logout
```

## User Profile

```http
GET /users/me
PATCH /users/me
GET /users/me/progress
```

## Instruments

```http
GET /instruments
POST /instruments
PATCH /instruments/:id
DELETE /instruments/:id
```

## Practice

```http
POST /practice-sessions
PATCH /practice-sessions/:id/end
POST /practice-sessions/:id/events
GET /practice-sessions/:id/summary
GET /practice-sessions/history
```

## Pieces

```http
GET /pieces
GET /pieces/:id
GET /pieces/:id/sections
POST /pieces/import
```

## Tutor

```http
POST /tutor/chat
POST /tutor/voice
POST /tutor/daily-plan
POST /tutor/explain-mistake
POST /tutor/next-exercise
```

---

# 24. AI Tutor Orchestration

Do not let the LLM control everything directly.

Use this pipeline:

```text
User plays
→ Input engine captures notes
→ Practice engine analyzes notes
→ Analytics service creates structured summary
→ Tutor service receives summary
→ LLM generates human explanation and next step
→ App displays/speaks feedback
```

This prevents hallucinated music analysis.

The LLM should be used for:

* explanations
* motivation
* lesson planning
* adapting tone
* answering questions
* summarizing practice
* creating personalized next steps

The deterministic practice engine should handle:

* note correctness
* rhythm accuracy
* tempo analysis
* score comparison
* timing error
* missed notes
* wrong notes
* section scoring

---

# 25. Example End-to-End Flow

## First-Time User

```text
1. User signs up.
2. App asks onboarding questions.
3. App asks user to connect piano.
4. User connects Bluetooth MIDI keyboard.
5. App asks user to play middle C.
6. App confirms detection.
7. Tutor gives first assessment:
   - play C-D-E-F-G
   - play simple rhythm
   - identify notes
8. App estimates beginner level.
9. Tutor creates first 7-day plan.
10. User completes day 1.
```

## Daily Practice

```text
1. User opens app.
2. Tutor says: “Today we’ll work on rhythm and bars 3–4.”
3. User starts practice.
4. App records MIDI.
5. Practice engine detects repeated late left-hand notes.
6. Tutor pauses and says: “Let’s isolate the left hand.”
7. User repeats section slowly.
8. Accuracy improves.
9. Tutor ends session with summary.
10. App updates progress and tomorrow’s plan.
```

---

# 26. MVP Roadmap

## Phase 1 — Core Prototype

Goal: prove note detection and feedback.

Build:

* user profile
* MIDI connection
* note visualization
* simple exercises
* basic note matching
* post-attempt feedback

Do not build full AI yet.

## Phase 2 — Guided Lessons

Build:

* beginner curriculum
* daily practice plan
* score/piece model
* simple tutor chat
* practice summaries

## Phase 3 — AI Personalization

Build:

* tutor memory
* adaptive lesson selection
* detailed mistake explanation
* voice chat
* weekly reports

## Phase 4 — Microphone Mode

Build:

* microphone calibration
* pitch/onset detection
* confidence scoring
* limited note-recognition feedback

## Phase 5 — Advanced Learning

Build:

* imported MusicXML/MIDI pieces
* fingering suggestions
* dynamics feedback
* sight-reading
* ear training
* repertoire recommendation

---

# 27. Acceptance Criteria

The MVP is successful when:

1. User can connect a digital piano through MIDI.
2. App detects notes correctly with timestamps.
3. App can compare played notes to a simple exercise.
4. App can say which notes were correct, wrong, missed, early, or late.
5. App can generate a useful practice summary.
6. AI tutor can explain the user’s actual mistakes.
7. App can create a personalized daily practice plan.
8. User can complete a full 10-minute guided practice session.

---

# 28. Important Design Decisions

## Choose MIDI First

MIDI should be the primary experience because it is accurate and responsive.

## Treat Microphone as Fallback

Microphone recognition is useful for acoustic pianos, but it must include confidence scoring and softer feedback.

## Separate Music Analysis from AI Chat

The AI tutor should not guess. The app should give the AI structured performance data.

## Make Practice Small and Specific

The tutor should often say:

```text
Practice bars 3–4, left hand only, at 55 BPM, for 3 minutes.
```

Not:

```text
Practice more.
```

## Prioritize Retention

The app should make the user want to return tomorrow.

---

# 29. Final Instruction to AI Coder

Build this application as a modular, mobile-first AI piano tutor.

Start with a reliable MIDI-based MVP. Create clean abstractions for input providers, note events, score notes, practice sessions, analysis results, and tutor responses. Do not overbuild the AI before the practice engine works. The most important technical foundation is accurate capture of what the user played and clear comparison against what they were supposed to play.

The app should feel like a real teacher: observant, personalized, encouraging, and specific. It should help the user improve every day through small focused practice sessions, not just generic lessons.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API?utm_source=chatgpt.com "Web MIDI API - MDN Web Docs - Mozilla"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia?utm_source=chatgpt.com "MediaDevices: getUserMedia() method - Web APIs | MDN"
[3]: https://www.npmjs.com/package/%40magenta/music?activeTab=code&utm_source=chatgpt.com "magenta/music"
[4]: https://midi.org/universal-midi-packet-ump-and-midi-2-0-protocol-specification?utm_source=chatgpt.com "Universal MIDI Packet (UMP) and"
