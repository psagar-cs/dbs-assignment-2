"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlanner, timeToMinutes, BLOCK_COLORS, isValidTime } from "./PlannerContext";
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

const COLOR_DOT: Record<string, string> = {
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  slate: "bg-stone-400",
};

function getBlockStyle(color: string) {
  return COLOR_STYLES[color] || COLOR_STYLES.slate;
}

/* ── Overlap column layout algorithm ── */
function computeColumns(blocks: TimeBlock[]): Map<number, { column: number; totalColumns: number }> {
  const result = new Map<number, { column: number; totalColumns: number }>();
  if (blocks.length === 0) return result;

  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Group into overlap clusters
  const clusters: TimeBlock[][] = [];
  let current: TimeBlock[] = [sorted[0]];
  let clusterEnd = timeToMinutes(sorted[0].endTime);

  for (let i = 1; i < sorted.length; i++) {
    const blockStart = timeToMinutes(sorted[i].time);
    if (blockStart < clusterEnd) {
      // Overlaps with cluster
      current.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, timeToMinutes(sorted[i].endTime));
    } else {
      clusters.push(current);
      current = [sorted[i]];
      clusterEnd = timeToMinutes(sorted[i].endTime);
    }
  }
  clusters.push(current);

  // Assign columns within each cluster
  for (const cluster of clusters) {
    const columns: TimeBlock[][] = [];
    for (const block of cluster) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (timeToMinutes(block.time) >= timeToMinutes(lastInCol.endTime)) {
          columns[col].push(block);
          result.set(block.id, { column: col, totalColumns: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([block]);
        result.set(block.id, { column: columns.length - 1, totalColumns: 0 });
      }
    }
    // Set totalColumns for all blocks in this cluster
    for (const block of cluster) {
      const entry = result.get(block.id)!;
      entry.totalColumns = columns.length;
    }
  }

  return result;
}

function handleTimeInput(value: string, setter: (v: string) => void) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    setter(digits);
  } else {
    setter(`${digits.slice(0, 2)}:${digits.slice(2)}`);
  }
}

/* ── Inline edit modal for time blocks ── */
function EditBlockModal({
  block,
  onSave,
  onDelete,
  onClose,
}: {
  block: TimeBlock;
  onSave: (time: string, endTime: string, label: string, color: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(block.label);
  const [time, setTime] = useState(block.time);
  const [endTime, setEndTime] = useState(block.endTime);
  const [color, setColor] = useState(block.color);
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted">Edit time block</h3>

        <div className="space-y-4">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-muted">Start</label>
              <input
                type="text"
                inputMode="numeric"
                value={time}
                onChange={(e) => handleTimeInput(e.target.value, setTime)}
                placeholder="HH:mm"
                maxLength={5}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm tabular-nums text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-muted">End</label>
              <input
                type="text"
                inputMode="numeric"
                value={endTime}
                onChange={(e) => handleTimeInput(e.target.value, setEndTime)}
                placeholder="HH:mm"
                maxLength={5}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm tabular-nums text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {BLOCK_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  color === c.value ? "ring-2 ring-offset-2 ring-offset-surface ring-foreground/30" : "hover:scale-110"
                }`}
              >
                <span className={`block h-4 w-4 rounded-full ${COLOR_DOT[c.value]}`} />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-muted-foreground">{error}</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onDelete}
            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50"
          >
            Delete
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!label.trim()) { setError("Please enter a description."); return; }
              if (!isValidTime(time) || !isValidTime(endTime)) { setError("Please enter valid times (00:00 – 23:59)."); return; }
              if (endTime <= time) { setError("End time must be after start time."); return; }
              setError("");
              onSave(time, endTime, label.trim(), color);
            }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Timeline block (clickable to edit) ── */
function TimelineBlock({
  block,
  startHour,
  endHour,
  column,
  totalColumns,
  onEdit,
}: {
  block: TimeBlock;
  startHour: number;
  endHour: number;
  column: number;
  totalColumns: number;
  onEdit: () => void;
}) {
  const totalMinutes = (endHour - startHour) * 60;
  const blockStart = timeToMinutes(block.time) - startHour * 60;
  const blockEnd = timeToMinutes(block.endTime) - startHour * 60;
  const top = (blockStart / totalMinutes) * 100;
  const height = ((blockEnd - blockStart) / totalMinutes) * 100;
  const style = getBlockStyle(block.color);

  // left gutter = 4rem, right padding = 0.75rem
  const leftCalc = `calc(4rem + ${column} / ${totalColumns} * (100% - 4rem - 0.75rem))`;
  const widthCalc = `calc((100% - 4rem - 0.75rem) / ${totalColumns})`;

  return (
    <div
      className={`absolute cursor-pointer rounded-lg border-l-4 px-3 py-2 transition-shadow hover:shadow-md ${style.bg} ${style.border}`}
      style={{ top: `${top}%`, height: `${height}%`, minHeight: "28px", left: leftCalc, width: widthCalc }}
      onClick={onEdit}
    >
      <p className={`text-xs font-semibold leading-tight ${style.text} truncate`}>
        {block.label}
      </p>
      <p className={`mt-0.5 text-[11px] tabular-nums ${style.time}`}>
        {block.time} – {block.endTime}
      </p>
    </div>
  );
}

export default function DayPlanner({ date }: { date: Date }) {
  const { tasks, notes, schedule, toggleTask, editTask, deleteTask, editNote, deleteNote, editTimeBlock, deleteTimeBlock } = usePlanner();

  const dateStr = toDateString(date);
  const dayTasks = tasks.filter((t) => t.date === dateStr);
  const dayNotes = notes.filter((n) => n.date === dateStr);
  const daySchedule = schedule.filter((s) => s.date === dateStr);
  const doneCount = dayTasks.filter((t) => t.done).length;

  const prevDay = toDateString(addDays(date, -1));
  const nextDay = toDateString(addDays(date, 1));

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

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
  const columnLayout = computeColumns(daySchedule);

  return (
    <div className="min-h-screen bg-background">
      {/* Edit block modal */}
      {editingBlock && (
        <EditBlockModal
          block={editingBlock}
          onSave={(time, endTime, label, color) => {
            editTimeBlock(editingBlock.id, time, endTime, label, color);
            setEditingBlock(null);
          }}
          onDelete={() => {
            deleteTimeBlock(editingBlock.id);
            setEditingBlock(null);
          }}
          onClose={() => setEditingBlock(null)}
        />
      )}

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
                    {editingTaskId === task.id ? (
                      <div className="flex items-center gap-2 rounded-xl border border-accent bg-surface px-4 py-2.5">
                        <input
                          type="text"
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingTaskText.trim()) {
                              editTask(task.id, editingTaskText.trim());
                              setEditingTaskId(null);
                            }
                            if (e.key === "Escape") setEditingTaskId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-transparent text-sm text-foreground outline-none"
                        />
                        <button
                          onClick={() => {
                            if (editingTaskText.trim()) {
                              editTask(task.id, editingTaskText.trim());
                              setEditingTaskId(null);
                            }
                          }}
                          className="text-xs font-semibold text-accent hover:brightness-110"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all hover:border-border-strong hover:shadow-sm">
                        <label className="flex flex-1 cursor-pointer items-center gap-3.5">
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
                        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => { setEditingTaskId(task.id); setEditingTaskText(task.text); }}
                            className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-background hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="rounded-lg px-2 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
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
                    <li key={note.id} className="group">
                      {editingNoteId === note.id ? (
                        <div className="flex items-center gap-2 px-5 py-3">
                          <input
                            type="text"
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editingNoteText.trim()) {
                                editNote(note.id, editingNoteText.trim());
                                setEditingNoteId(null);
                              }
                              if (e.key === "Escape") setEditingNoteId(null);
                            }}
                            autoFocus
                            className="flex-1 bg-transparent text-sm text-foreground outline-none"
                          />
                          <button
                            onClick={() => {
                              if (editingNoteText.trim()) {
                                editNote(note.id, editingNoteText.trim());
                                setEditingNoteId(null);
                              }
                            }}
                            className="text-xs font-semibold text-accent hover:brightness-110"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-5 py-4">
                          <span className="flex-1 text-sm leading-relaxed text-foreground">
                            {note.text}
                          </span>
                          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}
                              className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-background hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="rounded-lg px-2 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
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
                  {daySchedule.map((block) => {
                    const layout = columnLayout.get(block.id) || { column: 0, totalColumns: 1 };
                    return (
                      <TimelineBlock
                        key={block.id}
                        block={block}
                        startHour={startHour}
                        endHour={endHour}
                        column={layout.column}
                        totalColumns={layout.totalColumns}
                        onEdit={() => setEditingBlock(block)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
