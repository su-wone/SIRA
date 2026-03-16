import { describe, it, expect } from "vitest";
import { taskSchema, epicSchema, siraConfigSchema } from "./index.js";

describe("taskSchema", () => {
  const validTask = {
    id: "TASK-001",
    title: "로그인 화면 개발",
    status: "todo",
    assignee: "지영",
    priority: "high",
    area: "web",
    epic_id: "EP-001",
    related_files: ["src/app/login/page.tsx"],
    tags: ["auth"],
    created_at: "2026-03-12",
    updated_at: "2026-03-12",
  };

  it("validates a correct task", () => {
    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const minimal = {
      id: "TASK-002",
      title: "최소 태스크",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    };
    const result = taskSchema.parse(minimal);
    expect(result.status).toBe("backlog");
    expect(result.priority).toBe("medium");
    expect(result.related_files).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it("rejects invalid status", () => {
    const invalid = { ...validTask, status: "invalid_status" };
    const result = taskSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = taskSchema.safeParse({ title: "no id" });
    expect(result.success).toBe(false);
  });
});

describe("epicSchema", () => {
  it("validates a correct epic", () => {
    const epic = {
      id: "EP-001",
      title: "소셜 로그인",
      status: "in_progress",
      owner: "수원",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    };
    const result = epicSchema.safeParse(epic);
    expect(result.success).toBe(true);
  });

  it("rejects invalid epic status", () => {
    const result = epicSchema.safeParse({
      id: "EP-002",
      title: "test",
      status: "review",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    expect(result.success).toBe(false);
  });
});

describe("siraConfigSchema", () => {
  it("validates a correct config", () => {
    const config = {
      project: "my-project",
      version: "1",
      team: [
        { name: "수원", role: "admin", type: "human", github_username: "suwon" },
        { name: "Claude", role: "agent", type: "ai" },
      ],
    };
    const result = siraConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("rejects invalid member role", () => {
    const config = {
      project: "test",
      team: [{ name: "test", role: "superadmin", type: "human" }],
    };
    const result = siraConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});
