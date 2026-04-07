"use client";

import Link from "next/link";
import { usePlanner, timeToMinutes } from "@/components/PlannerContext";
import type { TimeBlock, Priority } from "@/components/PlannerContext";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDays(today: Date): Date[] {
  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BLOCK_BG: Record<string, string> = {
  amber: "bg-amber-300",
  blue: "bg-blue-300",
  emerald: "bg-emerald-300",
  rose: "bg-rose-300",
  violet: "bg-violet-300",
  slate: "bg-stone-300",
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-rose-400",
  medium: "bg-amber-400",
  low: "bg-blue-400",
  none: "bg-stone-300",
};

/* ── Mini vertical timeline ── */
function MiniTimeline({ blocks }: { blocks: TimeBlock[] }) {
  if (blocks.length === 0) return null;

  // Fixed range: 7:00–22:00 for consistent sizing across days
  const rangeStart = 7 * 60;
  const rangeEnd = 22 * 60;
  const total = rangeEnd - rangeStart;

  return (
    <div className="relative h-24 w-full rounded-lg bg-background/60 overflow-hidden">
      {/* Hour ticks */}
      {[8, 12, 16, 20].map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-border/40"
          style={{ top: `${((h * 60 - rangeStart) / total) * 100}%` }}
        />
      ))}

      {/* Blocks */}
      {blocks.map((block) => {
        const start = Math.max(timeToMinutes(block.time) - rangeStart, 0);
        const end = Math.min(timeToMinutes(block.endTime) - rangeStart, total);
        const top = (start / total) * 100;
        const height = ((end - start) / total) * 100;
        const bg = BLOCK_BG[block.color] || BLOCK_BG.slate;

        return (
          <div
            key={block.id}
            className={`absolute left-0.5 right-0.5 rounded-sm ${bg} opacity-80`}
            style={{ top: `${top}%`, height: `${Math.max(height, 2)}%` }}
          />
        );
      })}
    </div>
  );
}

export default function WeekPage() {
  const { tasks, notes, schedule } = usePlanner();
  const today = new Date();
  const todayStr = toDateString(today);
  const days = getWeekDays(today);

  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                Week overview
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {monthLabel}
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-border-strong hover:text-foreground"
            >
              Back to today
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Desktop: 7-column grid */}
        <div className="hidden gap-3 lg:grid lg:grid-cols-7">
          {days.map((date) => {
            const dateStr = toDateString(date);
            const isCurrentDay = dateStr === todayStr;
            const dayTasks = tasks.filter((t) => t.date === dateStr);
            const daySchedule = schedule.filter((s) => s.date === dateStr);
            const doneCount = dayTasks.filter((t) => t.done).length;
            const openTasks = dayTasks.filter((t) => !t.done);
            const hasItems = dayTasks.length + daySchedule.length > 0;

            return (
              <Link
                key={dateStr}
                href={isCurrentDay ? "/" : `/day/${dateStr}`}
                className={`group flex flex-col rounded-2xl border p-4 transition-all hover:shadow-md ${
                  isCurrentDay
                    ? "border-accent/40 bg-accent-light/50 shadow-sm"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                {/* Day header */}
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    isCurrentDay ? "text-accent" : "text-muted"
                  }`}
                >
                  {DAY_SHORT[date.getDay()]}
                </p>
                <p
                  className={`mt-0.5 text-2xl font-bold tabular-nums ${
                    isCurrentDay ? "text-accent" : "text-foreground"
                  }`}
                >
                  {date.getDate()}
                </p>

                {/* Mini timeline */}
                {daySchedule.length > 0 && (
                  <div className="mt-3">
                    <MiniTimeline blocks={daySchedule} />
                  </div>
                )}

                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
                      {doneCount}/{dayTasks.length} done
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {dayTasks.map((t) => (
                        <span
                          key={t.id}
                          className={`inline-block h-2 w-2 rounded-full ${
                            t.done
                              ? "bg-border"
                              : PRIORITY_DOT[t.priority]
                          }`}
                          title={`${t.text}${t.done ? " (done)" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!hasItems && (
                  <p className="mt-3 text-[11px] text-muted">
                    Nothing planned
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile/tablet: stacked cards */}
        <div className="space-y-3 lg:hidden">
          {days.map((date) => {
            const dateStr = toDateString(date);
            const isCurrentDay = dateStr === todayStr;
            const dayTasks = tasks.filter((t) => t.date === dateStr);
            const daySchedule = schedule.filter((s) => s.date === dateStr);
            const doneCount = dayTasks.filter((t) => t.done).length;
            const hasItems = dayTasks.length + daySchedule.length > 0;

            return (
              <Link
                key={dateStr}
                href={isCurrentDay ? "/" : `/day/${dateStr}`}
                className={`flex items-start gap-5 rounded-2xl border p-5 transition-all hover:shadow-md ${
                  isCurrentDay
                    ? "border-accent/40 bg-accent-light/50 shadow-sm"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                {/* Day number + mini timeline */}
                <div className="w-16 shrink-0">
                  <p
                    className={`text-center text-[10px] font-bold uppercase tracking-widest ${
                      isCurrentDay ? "text-accent" : "text-muted"
                    }`}
                  >
                    {DAY_SHORT[date.getDay()]}
                  </p>
                  <p
                    className={`text-center text-2xl font-bold tabular-nums ${
                      isCurrentDay ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                  {daySchedule.length > 0 && (
                    <div className="mt-2">
                      <MiniTimeline blocks={daySchedule} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    {DAY_NAMES[date.getDay()]}
                  </p>

                  {/* Task summary */}
                  {dayTasks.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                        {doneCount}/{dayTasks.length} tasks done
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dayTasks.map((t) => (
                          <span
                            key={t.id}
                            className={`inline-block h-2.5 w-2.5 rounded-full ${
                              t.done
                                ? "bg-border"
                                : PRIORITY_DOT[t.priority]
                            }`}
                            title={`${t.text}${t.done ? " (done)" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule summary */}
                  {daySchedule.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {daySchedule.length} event{daySchedule.length > 1 ? "s" : ""} · {daySchedule[0].time}–{daySchedule[daySchedule.length - 1].endTime}
                    </p>
                  )}

                  {!hasItems && (
                    <p className="text-xs text-muted">Nothing planned</p>
                  )}
                </div>

                <span className="mt-1 text-muted transition-colors group-hover:text-foreground">
                  &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
