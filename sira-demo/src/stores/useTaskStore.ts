import { create } from 'zustand';
import { Task, TaskStatus } from '@/data/types';
import { mockTasks } from '@/data/mock-tasks';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  getTasksByEpic: (epicId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status, progress: status === 'done' ? 100 : t.progress }
          : t
      ),
    })),

  updateTaskProgress: (taskId, progress) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, progress } : t
      ),
    })),

  getTasksByEpic: (epicId) => get().tasks.filter((t) => t.epicId === epicId),
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getTasksByAssignee: (assigneeId) => get().tasks.filter((t) => t.assigneeId === assigneeId),
}));
