"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePlanner } from "@/components/PlannerContext";

type ItemType = "task" | "note" | "time-block";

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTask, addNote, addTimeBlock } = usePlanner();

  const [type, setType] = useState<ItemType>("task");
  const [date, setDate] = useState(searchParams.get("date") || todayString());
  const [text, setText] = useState("");
  const [time, setTime] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    if (type === "task") {
      addTask(date, text.trim());
    } else if (type === "note") {
      addNote(date, text.trim());
    } else {
      if (!time.trim()) return;
      addTimeBlock(date, time.trim(), text.trim());
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

          {/* Time (only for time blocks) */}
          {type === "time-block" && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
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
