import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { UserProfile } from "@/lib/user/profile";
import type { ExerciseRecord } from "@/lib/practice/progress";
import { EXERCISES } from "@/lib/practice/exercises";
import { levelLabel, goalLabel, styleLabel } from "@/lib/user/profile";

type PlanRequest = {
  profile: UserProfile;
  progress: ExerciseRecord[];
};

type DailyPlan = {
  greeting: string;
  focus: string;
  exercises: { id: string; title: string; reason: string }[];
  tip: string;
};

const client = new Anthropic();

function buildSystemPrompt(profile: UserProfile, progress: ExerciseRecord[]): string {
  const masteredIds = new Set(
    progress.filter((r) => r.bestAccuracy >= 0.9).map((r) => r.exerciseId)
  );
  const inProgressIds = new Set(
    progress
      .filter((r) => r.bestAccuracy > 0 && r.bestAccuracy < 0.9)
      .map((r) => r.exerciseId)
  );

  const exerciseList = EXERCISES.map((ex) => {
    const record = progress.find((r) => r.exerciseId === ex.id);
    const statusLabel = masteredIds.has(ex.id)
      ? "mastered"
      : inProgressIds.has(ex.id)
      ? `in progress (best: ${Math.round((record?.bestAccuracy ?? 0) * 100)}%)`
      : "not started";
    return `- ${ex.title} [${ex.level}] — ${statusLabel}`;
  }).join("\n");

  return `You are a piano tutor AI creating a personalized daily practice plan.

User profile:
- Level: ${levelLabel(profile.level)}
- Goal: ${goalLabel(profile.goal)}
- Daily practice time: ${profile.dailyMinutes} minutes
- Teaching style preference: ${styleLabel(profile.tutorStyle)}

Exercise library and current progress:
${exerciseList}

You must respond with a JSON object matching this exact structure:
{
  "greeting": "one warm sentence greeting the user",
  "focus": "one sentence describing today's focus area",
  "exercises": [
    { "id": "<exercise-id>", "title": "<exercise-title>", "reason": "one short sentence why this exercise today" }
  ],
  "tip": "one practical piano tip relevant to this user's level and goal"
}

Rules:
- Choose 2–4 exercises that fit within the daily minutes budget (each exercise takes ~3–5 min)
- Prioritize exercises that are in progress before new ones
- Include at least one exercise the user has mastered as a warm-up
- Match the tone of the greeting and tip to the teaching style: ${styleLabel(profile.tutorStyle)}
- Only use exercise IDs from the library above
- Return valid JSON only, no markdown`;
}

export async function POST(req: NextRequest) {
  try {
    const body: PlanRequest = await req.json();
    const { profile, progress } = body;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: buildSystemPrompt(profile, progress),
      messages: [{ role: "user", content: "Generate my daily practice plan." }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const plan: DailyPlan = JSON.parse(text);

    return Response.json(plan);
  } catch (err) {
    console.error("Plan generation error:", err);
    // Fallback plan
    const fallback: DailyPlan = {
      greeting: "Ready to practice? Let's keep the momentum going.",
      focus: "Build consistency with your current exercises.",
      exercises: [
        {
          id: "five-finger-c-up",
          title: "Five-Finger Pattern: C Major (ascending)",
          reason: "A reliable warm-up to get your fingers moving.",
        },
      ],
      tip: "Even 10 minutes of focused practice beats an hour of distracted playing.",
    };
    return Response.json(fallback);
  }
}
