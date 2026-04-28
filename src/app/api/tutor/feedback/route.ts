import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { Exercise, ExerciseResult } from "@/lib/practice/types";

export async function POST(req: NextRequest) {
  try {
    const {
      exercise,
      result,
    }: { exercise: Exercise; result: ExerciseResult } = await req.json();

    const totalSteps = exercise.kind === "musical"
      ? exercise.notes.length
      : exercise.sequence.length;
    const accuracy = Math.round((result.correctFirstTry / totalSteps) * 100);
    const durationSec = Math.round(result.durationMs / 1000);

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system:
        "You are a friendly, encouraging piano tutor giving brief post-exercise feedback. Be specific, warm, and concise. Always end with one concrete tip for next time.",
      messages: [
        {
          role: "user",
          content: `Student completed exercise: "${exercise.title}"
Steps completed: ${totalSteps}
First-try accuracy: ${accuracy}%
Wrong attempts: ${result.totalWrongAttempts}
Duration: ${durationSec} seconds

Give feedback in 2–3 sentences.`,
        },
      ],
    });

    const feedback =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Great work! Keep practicing to build muscle memory.";

    return Response.json({ feedback });
  } catch {
    return Response.json({
      feedback:
        "Great work completing the exercise! Consistent practice builds muscle memory — try again to improve your first-try accuracy.",
    });
  }
}
