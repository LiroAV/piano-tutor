import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { UserProfile } from "@/lib/user/profile";
import { levelLabel, goalLabel, styleLabel } from "@/lib/user/profile";
import { EXERCISES } from "@/lib/practice/exercises";

const EXERCISE_LIST = EXERCISES.map((e) => `- ${e.title}`).join("\n");

function buildSystemPrompt(profile?: UserProfile): string {
  const profileSection = profile
    ? `\nUser profile:
- Level: ${levelLabel(profile.level)}
- Goal: ${goalLabel(profile.goal)}
- Daily practice time: ${profile.dailyMinutes} minutes
- Preferred teaching style: ${styleLabel(profile.tutorStyle)}\n`
    : "";

  const toneInstruction = profile
    ? `Tone: match the "${styleLabel(profile.tutorStyle)}" teaching style throughout.`
    : "Tone: be kind and encouraging.";

  return `You are an expert piano tutor inside an interactive piano-learning app.
${profileSection}
Your job is to help the user improve at piano through clear explanations, structured practice, encouragement, and precise feedback based on their real playing data.

You must:
- adapt to the user's level
- be kind but honest
- avoid overwhelming beginners
- explain musical concepts simply
- give specific next actions
- prioritize slow, accurate practice over speed
- identify patterns in mistakes
- ask the user to play short exercises when useful
- celebrate measurable improvement
- never pretend to hear something unless practice data was provided
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
- consider the user's goal, available time, current skill level, recent mistakes, and current piece
- include warm-up, focused practice, theory or reading, and review
- keep the plan realistic

The app has these exercises available:
${EXERCISE_LIST}

${toneInstruction}
Keep responses concise — 3–5 sentences for most questions, unless depth is requested.`;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const { messages, profile }: { messages: ChatMessage[]; profile?: UserProfile } =
      await req.json();

    const client = new Anthropic();

    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("Sorry, I couldn't respond right now.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
