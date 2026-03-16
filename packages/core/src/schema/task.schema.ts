import { z } from "zod";

export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
  "cancelled",
] as const;

export const TASK_PRIORITIES = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export const TASK_AREAS = ["web", "server", "shared"] as const;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(TASK_STATUSES).default("backlog"),
  assignee: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  area: z.enum(TASK_AREAS).optional(),
  epic_id: z.string().optional(),
  story_id: z.string().optional(),
  related_files: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskArea = (typeof TASK_AREAS)[number];
