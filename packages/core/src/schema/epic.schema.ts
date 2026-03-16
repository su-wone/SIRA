import { z } from "zod";

export const EPIC_STATUSES = [
  "backlog",
  "in_progress",
  "done",
  "cancelled",
] as const;

export const epicSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(EPIC_STATUSES).default("backlog"),
  owner: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Epic = z.infer<typeof epicSchema>;
export type EpicStatus = (typeof EPIC_STATUSES)[number];
