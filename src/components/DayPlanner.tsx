"use client";

import Link from "next/link";
import { usePlanner, timeToMinutes } from "./PlannerContext";
import type { TimeBlock } from "./PlannerContext";

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

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; time: string }> = {
  amber:   { bg: "bg-amber-50",   border: "border-l-amber-400",   text: "text-amber-900",   time: "text-amber-600" },
  blue:    { bg: "bg-blue-50",    border: "border-l-blue-400",    text: "text-blue-900",    time: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", border: "border-l-emerald-400", text: "text-emerald-900", time: "text-emerald-600" },
  rose:    { bg: "bg-rose-50",    border: "border-l-rose-400",    text: "text-rose-900",    time: "text-rose-600" },
  violet:  { bg: "bg-violet-50",  border: "border-l-violet-400",  text: "text-violet-900",  time: "text-violet-600" },
  slate:   { bg: "bg-stone-100",  border: "border-l-stone-400",   text: "text-stone-900",   time: "text-stone-500" },
};

function getBlockStyle(color: string) {
  return COLOR_STYLES[color] || COLOR_STYLES.slate;
}

function TimelineBlock({ block, startHour, endHour }: { block: TimeBlock; startHour: number; endHour: number }) {
  const totalMinutes = (endHour - startHour) * 60;
  const blockStart = timeToMinutes(block.time) - startHour * 60;
  const blockEnd = timeToMinutes(block.endTime) - startHour * 60;
  const top = (blockStart / totalMinutes) * 100;
  const height = ((blockEnd - blockStart) / totalMinutes) * 100;
  const style = getBlockStyle(block.color);

  return (
    <div
      className={`absolute left-16 right-3 rounded-lg border-l-4 px-3 py-2 transition-shadow hover:shadow-md ${style.bg} ${style.border}`}
      style={{ top: `${top}%`, height: `${height}%`, minHeight: "28px" }}
    >
      <p className={`text-xs font-semibold leading-tight ${style.text}`}>
        {block.label}
      </p>
      <p className={`mt-0.5 text-[11px] tabular-nums ${style.time}`}>
        {block.time} – {block.endTime}
      </p>
    </div>
  );
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

  // Compute timeline bounds from schedule
  let startHour = 7;
  let endHour = 22;
  if (daySchedule.length > 0) {
    const earliest = Math.min(...daySchedule.map((b) => timeToMinutes(b.time)));
    const latest = Math.max(...daySchedule.map((b) => timeToMinutes(b.endTime)));
    startHour = Math.floor(earliest / 60);
    endHour = Math.ceil(latest / 60);
    if (endHour === startHour) endHour = startHour + 1;
  }
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

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

          {/* Schedule — Visual Timeline */}
          <section className="lg:col-span-2">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted">
              Schedule
            </h2>
            {daySchedule.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No time blocks yet</p>
            ) : (
              <div className="rounded-xl border border-border bg-surface">
                <div className="relative my-3" style={{ height: `${hours.length * 64}px` }}>
                  {/* Hour grid lines */}
                  {hours.map((hour, i) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 flex items-center"
                      style={{ top: `${(i / hours.length) * 100}%`, transform: "translateY(-50%)" }}
                    >
                      <span className="w-14 shrink-0 pl-4 text-[11px] font-medium tabular-nums text-muted">
                        {String(hour).padStart(2, "0")}:00
                      </span>
                      <div className="flex-1 border-t border-border" />
                    </div>
                  ))}

                  {/* Time blocks */}
                  {daySchedule.map((block) => (
                    <TimelineBlock
                      key={block.id}
                      block={block}
                      startHour={startHour}
                      endHour={endHour}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
