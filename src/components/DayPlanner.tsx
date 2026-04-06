"use client";

import Link from "next/link";
import { usePlanner } from "./PlannerContext";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
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
  const doneCount = dayTasks.filter((t) => t.done).length;

  const prevDay = toDateString(addDays(date, -1));
  const nextDay = toDateString(addDays(date, 1));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Link
                href={`/day/${prevDay}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-all hover:border-border-strong hover:text-foreground"
                aria-label="Previous day"
              >
                &larr;
              </Link>
              <div>
                {isToday(date) && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                    Today
                  </p>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {formatDate(date)}
                </h1>
              </div>
              <Link
                href={`/day/${nextDay}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-all hover:border-border-strong hover:text-foreground"
                aria-label="Next day"
              >
                &rarr;
              </Link>
            </div>
            <nav className="flex items-center gap-5">
              <Link
                href="/week"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Week
              </Link>
              {!isToday(date) && (
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Today
                </Link>
              )}
              <Link
                href={`/new?date=${dateStr}`}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
              >
                + Add
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Tasks */}
          <section>
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
                Tasks
              </h2>
              {dayTasks.length > 0 && (
                <span className="text-xs tabular-nums text-muted">
                  {doneCount} of {dayTasks.length} done
                </span>
              )}
            </div>
            {dayTasks.length > 0 && (
              <div className="mb-4 h-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(doneCount / dayTasks.length) * 100}%` }}
                />
              </div>
            )}
            {dayTasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No tasks yet</p>
            ) : (
              <ul className="space-y-2">
                {dayTasks.map((task) => (
                  <li key={task.id}>
                    <label className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all hover:border-border-strong hover:shadow-sm">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          task.done
                            ? "text-muted line-through"
                            : "text-foreground"
                        }`}
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
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted">
              Notes
            </h2>
            {dayNotes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No notes yet</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <ul className="divide-y divide-border">
                  {dayNotes.map((note) => (
                    <li
                      key={note.id}
                      className="px-5 py-4 text-sm leading-relaxed text-foreground"
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
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted">
              Schedule
            </h2>
            {daySchedule.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No time blocks yet</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <ul className="divide-y divide-border">
                  {daySchedule.map((block) => (
                    <li key={block.id} className="flex items-center gap-5 px-5 py-4">
                      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-accent">
                        {block.time}
                      </span>
                      <span className="text-sm text-foreground">
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
