"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Task {
  id: number;
  date: string;
  text: string;
  done: boolean;
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
  label: string;
}

interface PlannerState {
  tasks: Task[];
  notes: Note[];
  schedule: TimeBlock[];
  toggleTask: (id: number) => void;
  addTask: (date: string, text: string) => void;
  addNote: (date: string, text: string) => void;
  addTimeBlock: (date: string, time: string, label: string) => void;
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
  { id: 1, date: today, text: "Review lecture notes for MPCS 51238", done: false },
  { id: 2, date: today, text: "Push planner project to GitHub", done: true },
  { id: 3, date: today, text: "Grocery run — milk, eggs, coffee", done: false },
  { id: 4, date: today, text: "Read chapter 5 of design patterns book", done: false },
  { id: 5, date: today, text: "Reply to team Slack thread", done: true },
];

const seedNotes: Note[] = [
  { id: 1, date: today, text: "Office hours moved to 3 PM this week" },
  { id: 2, date: today, text: "Try the new cafe on 53rd for studying" },
  { id: 3, date: today, text: "Remember to submit project proposal by Friday" },
];

const seedSchedule: TimeBlock[] = [
  { id: 1, date: today, time: "8:00 AM", label: "Morning workout" },
  { id: 2, date: today, time: "9:30 AM", label: "MPCS 51238 lecture" },
  { id: 3, date: today, time: "11:00 AM", label: "Work on planner project" },
  { id: 4, date: today, time: "12:30 PM", label: "Lunch with Alex" },
  { id: 5, date: today, time: "2:00 PM", label: "Study session — library" },
  { id: 6, date: today, time: "4:00 PM", label: "Team meeting (Zoom)" },
  { id: 7, date: today, time: "6:00 PM", label: "Dinner & free time" },
  { id: 8, date: today, time: "8:00 PM", label: "Reading / wind down" },
];

let nextId = 100;

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [notes, setNotes] = useState<Note[]>(seedNotes);
  const [schedule, setSchedule] = useState<TimeBlock[]>(seedSchedule);

  const toggleTask = useCallback((id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const addTask = useCallback((date: string, text: string) => {
    setTasks((prev) => [...prev, { id: nextId++, date, text, done: false }]);
  }, []);

  const addNote = useCallback((date: string, text: string) => {
    setNotes((prev) => [...prev, { id: nextId++, date, text }]);
  }, []);

  const addTimeBlock = useCallback((date: string, time: string, label: string) => {
    setSchedule((prev) => [...prev, { id: nextId++, date, time, label }]);
  }, []);

  return (
    <PlannerContext.Provider value={{ tasks, notes, schedule, toggleTask, addTask, addNote, addTimeBlock }}>
      {children}
    </PlannerContext.Provider>
  );
}
