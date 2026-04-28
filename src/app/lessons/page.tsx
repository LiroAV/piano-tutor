import Link from "next/link";
import { EXERCISES } from "@/lib/practice/exercises";
import type { Exercise } from "@/lib/practice/types";

export default function LessonsPage() {
  const absoluteBeginner = EXERCISES.filter((e) => e.level === "absolute_beginner" && !e.kind);
  const beginner = EXERCISES.filter((e) => e.level === "beginner" && !e.kind);
  const intermediate = EXERCISES.filter((e) => e.level === "intermediate" && !e.kind);
  const pieces = EXERCISES.filter((e) => e.kind === "musical");
  const advanced = EXERCISES.filter((e) => e.level === "advanced" && !e.kind);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Lessons</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Work through the exercises in order, then tackle the full pieces below.
        </p>
      </div>

      <ExerciseGroup title="Absolute Beginner" exercises={absoluteBeginner} />
      <ExerciseGroup title="Beginner" exercises={beginner} />
      <ExerciseGroup title="Intermediate — Exercises" exercises={intermediate} />
      <ExerciseGroup title="Intermediate — Pieces (both hands)" exercises={pieces} badge="♩" />
      {advanced.length > 0 && <ExerciseGroup title="Advanced" exercises={advanced} />}
    </div>
  );
}

function ExerciseGroup({
  title,
  exercises,
  badge,
}: {
  title: string;
  exercises: Exercise[];
  badge?: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {title}
      </h2>
      <ul className="space-y-2">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link
              href={`/lessons/${ex.id}`}
              className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100 group-hover:text-white">
                  {ex.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                  {ex.description}
                </p>
              </div>
              <span className="ml-4 mt-0.5 text-xs text-zinc-600 shrink-0">
                {badge ?? (ex.kind === "musical"
                  ? `${ex.tempo} BPM`
                  : `${ex.sequence.length} note${ex.sequence.length !== 1 ? "s" : ""}`)}{" "}→
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
