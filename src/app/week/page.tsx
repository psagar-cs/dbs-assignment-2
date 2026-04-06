"use client";

import Link from "next/link";
import { usePlanner } from "@/components/PlannerContext";

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
            const dayNotes = notes.filter((n) => n.date === dateStr);
            const daySchedule = schedule.filter((s) => s.date === dateStr);
            const doneCount = dayTasks.filter((t) => t.done).length;
            const hasItems = dayTasks.length + dayNotes.length + daySchedule.length > 0;

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

                <div className="mt-3 flex-1 space-y-1.5">
                  {dayTasks.length > 0 && (
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {doneCount}/{dayTasks.length} tasks
                    </p>
                  )}

                  {dayTasks.slice(0, 2).map((t) => (
                    <p
                      key={t.id}
                      className={`truncate text-[11px] leading-snug ${
                        t.done
                          ? "text-muted line-through"
                          : "text-foreground"
                      }`}
                    >
                      {t.text}
                    </p>
                  ))}

                  {daySchedule.slice(0, 2).map((s) => (
                    <p
                      key={s.id}
                      className="truncate text-[11px] leading-snug text-muted-foreground"
                    >
                      <span className="font-medium text-accent">{s.time}–{s.endTime}</span>{" "}
                      {s.label}
                    </p>
                  ))}

                  {!hasItems && (
                    <p className="pt-1 text-[11px] text-muted">
                      Nothing planned
                    </p>
                  )}
                </div>
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
            const dayNotes = notes.filter((n) => n.date === dateStr);
            const daySchedule = schedule.filter((s) => s.date === dateStr);
            const doneCount = dayTasks.filter((t) => t.done).length;
            const hasItems = dayTasks.length + dayNotes.length + daySchedule.length > 0;

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
                <div className="w-14 shrink-0 text-center">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      isCurrentDay ? "text-accent" : "text-muted"
                    }`}
                  >
                    {DAY_SHORT[date.getDay()]}
                  </p>
                  <p
                    className={`text-2xl font-bold tabular-nums ${
                      isCurrentDay ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {DAY_NAMES[date.getDay()]}
                  </p>

                  {dayTasks.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {doneCount}/{dayTasks.length} tasks done
                    </p>
                  )}

                  {dayTasks.slice(0, 2).map((t) => (
                    <p
                      key={t.id}
                      className={`truncate text-xs ${
                        t.done ? "text-muted line-through" : "text-muted-foreground"
                      }`}
                    >
                      {t.text}
                    </p>
                  ))}

                  {daySchedule.slice(0, 2).map((s) => (
                    <p
                      key={s.id}
                      className="truncate text-xs text-muted-foreground"
                    >
                      <span className="font-medium text-accent">{s.time}–{s.endTime}</span>{" "}
                      {s.label}
                    </p>
                  ))}

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
