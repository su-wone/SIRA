"use client";

import { create } from "zustand";

export interface TaskEntry {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  priority: string;
  area?: string;
  epic_id?: string;
  story_id?: string;
  related_files: string[];
  tags: string[];
  start_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  file_path: string;
}

interface TaskStore {
  tasks: TaskEntry[];
  isLoading: boolean;
  setTasks: (tasks: TaskEntry[]) => void;
  updateTask: (id: string, updates: Partial<TaskEntry>) => void;
  setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  setTasks: (tasks) => set({ tasks }),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
