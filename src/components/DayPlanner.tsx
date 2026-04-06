"use client";

import Link from "next/link";
import { usePlanner } from "./PlannerContext";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isToday(date: Date): boolean {
  return toDateString(date) === toDateString(new Date());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function DayPlanner({ date }: { date: Date }) {
  const { tasks, notes, schedule, toggleTask } = usePlanner();

  const dateStr = toDateString(date);
  const dayTasks = tasks.filter((t) => t.date === dateStr);
  const dayNotes = notes.filter((n) => n.date === dateStr);
  const daySchedule = schedule.filter((s) => s.date === dateStr);

  const prevDay = toDateString(addDays(date, -1));
  const nextDay = toDateString(addDays(date, 1));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/day/${prevDay}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Previous day"
              >
                &larr;
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {isToday(date) ? "Today" : formatDate(date)}
                </h1>
                {isToday(date) && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(date)}
                  </p>
                )}
              </div>
              <Link
                href={`/day/${nextDay}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Next day"
              >
                &rarr;
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {!isToday(date) && (
                <Link
                  href="/"
                  className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Today
                </Link>
              )}
              <Link
                href={`/new?date=${dateStr}`}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                + Add
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Tasks */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Tasks
            </h2>
            {dayTasks.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No tasks for this day.</p>
            ) : (
              <ul className="space-y-2">
                {dayTasks.map((task) => (
                  <li key={task.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-50"
                      />
                      <span
                        className={
                          task.done
                            ? "text-zinc-400 line-through dark:text-zinc-500"
                            : "text-zinc-800 dark:text-zinc-200"
                        }
                      >
                        {task.text}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Notes */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Notes
            </h2>
            {dayNotes.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No notes for this day.</p>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {dayNotes.map((note) => (
                    <li
                      key={note.id}
                      className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      {note.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Schedule */}
          <section className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Schedule
            </h2>
            {daySchedule.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No time blocks for this day.</p>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {daySchedule.map((block) => (
                    <li key={block.id} className="flex items-center gap-4 px-4 py-3">
                      <span className="w-20 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {block.time}
                      </span>
                      <span className="text-sm text-zinc-800 dark:text-zinc-200">
                        {block.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
