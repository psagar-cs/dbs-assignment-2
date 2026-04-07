"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePlanner, BLOCK_COLORS, isValidTime } from "@/components/PlannerContext";
import type { Priority } from "@/components/PlannerContext";

type ItemType = "task" | "note" | "time-block";

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const COLOR_DOT: Record<string, string> = {
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  slate: "bg-stone-400",
};

export default function NewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTask, addNote, addTimeBlock } = usePlanner();

  const [type, setType] = useState<ItemType>("task");
  const [date, setDate] = useState(searchParams.get("date") || todayString());
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("blue");
  const [priority, setPriority] = useState<Priority>("none");
  const [error, setError] = useState("");

  function handleTimeInput(value: string, setter: (v: string) => void) {
    // Strip non-digits
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      setter(digits);
    } else {
      setter(`${digits.slice(0, 2)}:${digits.slice(2)}`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter a description.");
      return;
    }
    setError("");

    if (type === "task") {
      addTask(date, text.trim(), priority);
    } else if (type === "note") {
      addNote(date, text.trim());
    } else {
      if (!time.trim() || !endTime.trim()) {
        setError("Please enter both start and end times.");
        return;
      }
      if (!isValidTime(time) || !isValidTime(endTime)) {
        setError("Please enter valid times (00:00 – 23:59).");
        return;
      }
      if (endTime <= time) {
        setError("End time must be after start time.");
        return;
      }
      setError("");
      addTimeBlock(date, time.trim(), endTime.trim(), text.trim(), color);
    }

    router.push(date === todayString() ? "/" : `/day/${date}`);
  }

  const typeOptions: { value: ItemType; label: string }[] = [
    { value: "task", label: "Task" },
    { value: "note", label: "Note" },
    { value: "time-block", label: "Time Block" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-lg px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                New entry
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Add to your day
              </h1>
            </div>
            <Link
              href={date === todayString() ? "/" : `/day/${date}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type selector */}
          <div className="flex gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  type === opt.value
                    ? "bg-accent text-white shadow-sm"
                    : "border border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Priority (only for tasks) */}
          {type === "task" && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
                Priority
              </label>
              <div className="flex gap-2">
                {([
                  { value: "high" as Priority, label: "High", dot: "bg-rose-400" },
                  { value: "medium" as Priority, label: "Medium", dot: "bg-amber-400" },
                  { value: "low" as Priority, label: "Low", dot: "bg-blue-400" },
                  { value: "none" as Priority, label: "None", dot: "bg-stone-300" },
                ]).map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      priority === p.value
                        ? "bg-accent text-white shadow-sm"
                        : "border border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${priority === p.value ? "bg-white/70" : p.dot}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time fields (only for time blocks) */}
          {type === "time-block" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
                    Start time
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={time}
                    onChange={(e) => handleTimeInput(e.target.value, setTime)}
                    placeholder="HH:mm"
                    maxLength={5}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm tabular-nums text-foreground outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
                    End time
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={endTime}
                    onChange={(e) => handleTimeInput(e.target.value, setEndTime)}
                    placeholder="HH:mm"
                    maxLength={5}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm tabular-nums text-foreground outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
                  Color
                </label>
                <div className="flex gap-2">
                  {BLOCK_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        color === c.value
                          ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/30"
                          : "hover:scale-110"
                      }`}
                      aria-label={c.name}
                    >
                      <span className={`block h-5 w-5 rounded-full ${COLOR_DOT[c.value]}`} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Text */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
              {type === "task" ? "Task" : type === "note" ? "Note" : "Description"}
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                type === "task"
                  ? "What do you need to do?"
                  : type === "note"
                    ? "Write a note..."
                    : "What's happening at this time?"
              }
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-muted-foreground">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            Add {type === "time-block" ? "Time Block" : type === "task" ? "Task" : "Note"}
          </button>
        </form>
      </main>
    </div>
  );
}
