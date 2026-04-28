"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useProfile,
  type UserLevel,
  type UserGoal,
  type TutorStyle,
} from "@/lib/user/profile";

type Draft = {
  level: UserLevel | null;
  goal: UserGoal | null;
  dailyMinutes: number | null;
  tutorStyle: TutorStyle | null;
};

const STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    level: null,
    goal: null,
    dailyMinutes: null,
    tutorStyle: null,
  });

  function pick<K extends keyof Draft>(key: K, value: Draft[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);

    if (step < STEPS - 1) {
      setStep(step + 1);
    } else {
      // All steps done
      saveProfile({
        level: next.level!,
        goal: next.goal!,
        dailyMinutes: next.dailyMinutes!,
        tutorStyle: next.tutorStyle!,
        completedAt: new Date().toISOString(),
      });
      router.push("/");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Setup</span>
            <span>
              {step + 1} / {STEPS}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${((step + 1) / STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 0 && (
          <Step
            question="What's your piano experience?"
            options={[
              {
                value: "absolute_beginner" as UserLevel,
                label: "Absolute beginner",
                sub: "I've never played before",
              },
              {
                value: "beginner" as UserLevel,
                label: "Beginner",
                sub: "I know a few notes and simple songs",
              },
              {
                value: "intermediate" as UserLevel,
                label: "Intermediate",
                sub: "I can read sheet music",
              },
              {
                value: "returning" as UserLevel,
                label: "Returning player",
                sub: "I used to play but got rusty",
              },
            ]}
            onSelect={(v) => pick("level", v as UserLevel)}
          />
        )}

        {step === 1 && (
          <Step
            question="What are you aiming for?"
            options={[
              {
                value: "learn_basics" as UserGoal,
                label: "Learn the basics",
                sub: "Notes, rhythm, hand position",
              },
              {
                value: "learn_songs" as UserGoal,
                label: "Learn songs",
                sub: "Play pieces I enjoy",
              },
              {
                value: "improve_technique" as UserGoal,
                label: "Improve technique",
                sub: "Scales, precision, speed",
              },
              {
                value: "daily_habit" as UserGoal,
                label: "Build a daily habit",
                sub: "Stay consistent with practice",
              },
            ]}
            onSelect={(v) => pick("goal", v as UserGoal)}
          />
        )}

        {step === 2 && (
          <Step
            question="How many minutes can you practice daily?"
            options={[
              { value: 10, label: "10 minutes", sub: "Short but consistent" },
              { value: 20, label: "20 minutes", sub: "A solid daily session" },
              { value: 30, label: "30 minutes", sub: "Serious practice" },
              { value: 45, label: "45+ minutes", sub: "All in" },
            ]}
            onSelect={(v) => pick("dailyMinutes", v as number)}
          />
        )}

        {step === 3 && (
          <Step
            question="How would you like your tutor to teach?"
            options={[
              {
                value: "gentle" as TutorStyle,
                label: "Gentle",
                sub: "Patient and soft-spoken",
              },
              {
                value: "encouraging" as TutorStyle,
                label: "Encouraging",
                sub: "Upbeat and motivating",
              },
              {
                value: "analytical" as TutorStyle,
                label: "Analytical",
                sub: "Detailed and data-driven",
              },
              {
                value: "strict" as TutorStyle,
                label: "Strict",
                sub: "Direct and disciplined",
              },
            ]}
            onSelect={(v) => pick("tutorStyle", v as TutorStyle)}
          />
        )}

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

function Step({
  question,
  options,
  onSelect,
}: {
  question: string;
  options: { value: string | number; label: string; sub: string }[];
  onSelect: (value: string | number) => void;
}) {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-zinc-100 leading-snug">
        {question}
      </h1>
      <ul className="space-y-2">
        {options.map((opt) => (
          <li key={String(opt.value)}>
            <button
              onClick={() => onSelect(opt.value)}
              className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 hover:border-indigo-600 hover:bg-indigo-950/20 transition-colors group"
            >
              <p className="text-sm font-medium text-zinc-100 group-hover:text-white">
                {opt.label}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{opt.sub}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
