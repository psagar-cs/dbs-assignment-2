"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Priority = "high" | "medium" | "low" | "none";

export interface Task {
  id: number;
  date: string;
  text: string;
  done: boolean;
  priority: Priority;
}

export interface Note {
  id: number;
  date: string;
  text: string;
}

export interface TimeBlock {
  id: number;
  date: string;
  time: string;
  endTime: string;
  label: string;
  color: string;
}

export const BLOCK_COLORS = [
  { name: "Amber", value: "amber" },
  { name: "Blue", value: "blue" },
  { name: "Emerald", value: "emerald" },
  { name: "Rose", value: "rose" },
  { name: "Violet", value: "violet" },
  { name: "Slate", value: "slate" },
];

interface PlannerState {
  tasks: Task[];
  notes: Note[];
  schedule: TimeBlock[];
  toggleTask: (id: number) => void;
  addTask: (date: string, text: string, priority: Priority) => void;
  editTask: (id: number, text: string, priority: Priority) => void;
  deleteTask: (id: number) => void;
  addNote: (date: string, text: string) => void;
  editNote: (id: number, text: string) => void;
  deleteNote: (id: number) => void;
  addTimeBlock: (date: string, time: string, endTime: string, label: string, color: string) => void;
  editTimeBlock: (id: number, time: string, endTime: string, label: string, color: string) => void;
  deleteTimeBlock: (id: number) => void;
}

const PlannerContext = createContext<PlannerState | null>(null);

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = todayString();

const seedTasks: Task[] = [
  { id: 1, date: today, text: "Review lecture notes for MPCS 51238", done: false, priority: "high" },
  { id: 2, date: today, text: "Push planner project to GitHub", done: true, priority: "medium" },
  { id: 3, date: today, text: "Grocery run — milk, eggs, coffee", done: false, priority: "low" },
  { id: 4, date: today, text: "Read chapter 5 of design patterns book", done: false, priority: "none" },
  { id: 5, date: today, text: "Reply to team Slack thread", done: true, priority: "medium" },
];

const seedNotes: Note[] = [
  { id: 1, date: today, text: "Office hours moved to 3 PM this week" },
  { id: 2, date: today, text: "Try the new cafe on 53rd for studying" },
  { id: 3, date: today, text: "Remember to submit project proposal by Friday" },
];

const seedSchedule: TimeBlock[] = [
  { id: 1, date: today, time: "07:00", endTime: "08:00", label: "Morning workout", color: "emerald" },
  { id: 2, date: today, time: "09:00", endTime: "10:30", label: "MPCS 51238 lecture", color: "blue" },
  { id: 3, date: today, time: "10:45", endTime: "12:30", label: "Work on planner project", color: "violet" },
  { id: 4, date: today, time: "12:30", endTime: "13:30", label: "Lunch with Alex", color: "amber" },
  { id: 5, date: today, time: "14:00", endTime: "16:00", label: "Study session — library", color: "slate" },
  { id: 6, date: today, time: "15:00", endTime: "16:00", label: "Team meeting (Zoom)", color: "rose" },
  { id: 7, date: today, time: "18:00", endTime: "19:00", label: "Dinner & free time", color: "amber" },
  { id: 8, date: today, time: "20:00", endTime: "21:30", label: "Reading / wind down", color: "emerald" },
];

// Normalize any time string to 24h "HH:mm" format
function normalizeTime(raw: string): string {
  const mil = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (mil) {
    return `${String(parseInt(mil[1], 10)).padStart(2, "0")}:${mil[2]}`;
  }
  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = ampm[2];
    const period = ampm[3].toUpperCase();
    if (period === "AM" && h === 12) h = 0;
    if (period === "PM" && h !== 12) h += 12;
    return `${String(h).padStart(2, "0")}:${m}`;
  }
  return raw;
}

// Check if a "HH:mm" string is a valid 24h time
export function isValidTime(time: string): boolean {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

// Convert "HH:mm" to minutes since midnight for sorting
export function timeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

let nextId = 100;

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [notes, setNotes] = useState<Note[]>(seedNotes);
  const [schedule, setSchedule] = useState<TimeBlock[]>(seedSchedule);

  const toggleTask = useCallback((id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const addTask = useCallback((date: string, text: string, priority: Priority) => {
    setTasks((prev) => [...prev, { id: nextId++, date, text, done: false, priority }]);
  }, []);

  const editTask = useCallback((id: number, text: string, priority: Priority) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text, priority } : t)));
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNote = useCallback((date: string, text: string) => {
    setNotes((prev) => [...prev, { id: nextId++, date, text }]);
  }, []);

  const editNote = useCallback((id: number, text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const deleteNote = useCallback((id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addTimeBlock = useCallback((date: string, time: string, endTime: string, label: string, color: string) => {
    const normStart = normalizeTime(time);
    const normEnd = normalizeTime(endTime);
    setSchedule((prev) =>
      [...prev, { id: nextId++, date, time: normStart, endTime: normEnd, label, color }].sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
      )
    );
  }, []);

  const editTimeBlock = useCallback((id: number, time: string, endTime: string, label: string, color: string) => {
    const normStart = normalizeTime(time);
    const normEnd = normalizeTime(endTime);
    setSchedule((prev) =>
      prev.map((b) => (b.id === id ? { ...b, time: normStart, endTime: normEnd, label, color } : b))
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    );
  }, []);

  const deleteTimeBlock = useCallback((id: number) => {
    setSchedule((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <PlannerContext.Provider value={{ tasks, notes, schedule, toggleTask, addTask, editTask, deleteTask, addNote, editNote, deleteNote, addTimeBlock, editTimeBlock, deleteTimeBlock }}>
      {children}
    </PlannerContext.Provider>
  );
}
