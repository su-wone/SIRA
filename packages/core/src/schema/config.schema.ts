import { z } from "zod";

export const MEMBER_ROLES = ["admin", "member", "agent"] as const;
export const MEMBER_TYPES = ["human", "ai"] as const;

export const teamMemberSchema = z.object({
  name: z.string(),
  role: z.enum(MEMBER_ROLES),
  type: z.enum(MEMBER_TYPES),
  github_username: z.string().optional(),
});

export const siraConfigSchema = z.object({
  project: z.string(),
  version: z.string().default("1"),
  team: z.array(teamMemberSchema).default([]),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type SiraConfig = z.infer<typeof siraConfigSchema>;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type MemberType = (typeof MEMBER_TYPES)[number];
