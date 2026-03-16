import { describe, it, expect } from "vitest";
import {
  parseFilterString,
  filterEntries,
  sortEntries,
  groupEntries,
  queryIndex,
  findById,
  findSimilarIds,
} from "./engine.js";
import type { IndexEntry } from "../types/index.types.js";

const ENTRIES: IndexEntry[] = [
  {
    id: "TASK-001", title: "로그인 개발", status: "in_progress", assignee: "지영",
    priority: "high", area: "web", epic_id: "EP-001", related_files: [], tags: ["auth"],
    created_at: "2026-03-10", updated_at: "2026-03-12", file_path: "tasks/web/TASK-001.md", file_mtime: "",
  },
  {
    id: "TASK-002", title: "회원가입 API", status: "todo", assignee: "수원",
    priority: "medium", area: "server", epic_id: "EP-001", related_files: [], tags: ["auth", "api"],
    created_at: "2026-03-11", updated_at: "2026-03-11", file_path: "tasks/server/TASK-002.md", file_mtime: "",
  },
  {
    id: "TASK-003", title: "대시보드 레이아웃", status: "backlog", assignee: "Claude",
    priority: "low", area: "web", epic_id: "EP-002", related_files: [], tags: ["ui"],
    created_at: "2026-03-12", updated_at: "2026-03-12", file_path: "tasks/web/TASK-003.md", file_mtime: "",
  },
  {
    id: "TASK-004", title: "CI 설정", status: "done",
    priority: "critical", area: "shared", related_files: [], tags: [],
    created_at: "2026-03-09", updated_at: "2026-03-13", file_path: "tasks/shared/TASK-004.md", file_mtime: "",
  },
];

describe("parseFilterString", () => {
  it("parses key:value pairs", () => {
    const filters = parseFilterString("assignee:지영 status:todo");
    expect(filters.assignee).toBe("지영");
    expect(filters.status).toBe("todo");
  });

  it("returns empty for no matches", () => {
    expect(parseFilterString("hello world")).toEqual({});
  });
});

describe("filterEntries", () => {
  it("filters by status", () => {
    const result = filterEntries(ENTRIES, { status: "todo" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("TASK-002");
  });

  it("filters by assignee", () => {
    const result = filterEntries(ENTRIES, { assignee: "Claude" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("TASK-003");
  });

  it("filters by multiple fields", () => {
    const result = filterEntries(ENTRIES, { area: "web", status: "in_progress" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("TASK-001");
  });

  it("filters by tag", () => {
    const result = filterEntries(ENTRIES, { tag: "api" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("TASK-002");
  });

  it("returns all with empty filters", () => {
    expect(filterEntries(ENTRIES, {})).toHaveLength(4);
  });
});

describe("sortEntries", () => {
  it("sorts by priority ascending", () => {
    const result = sortEntries(ENTRIES, "priority");
    expect(result[0].priority).toBe("critical");
    expect(result[result.length - 1].priority).toBe("medium");
  });

  it("sorts by created_at descending", () => {
    const result = sortEntries(ENTRIES, "created_at", "desc");
    expect(result[0].created_at).toBe("2026-03-12");
    expect(result[result.length - 1].created_at).toBe("2026-03-09");
  });
});

describe("groupEntries", () => {
  it("groups by status", () => {
    const groups = groupEntries(ENTRIES, "status");
    expect(groups.get("in_progress")).toHaveLength(1);
    expect(groups.get("todo")).toHaveLength(1);
    expect(groups.get("backlog")).toHaveLength(1);
    expect(groups.get("done")).toHaveLength(1);
  });

  it("groups by epic_id", () => {
    const groups = groupEntries(ENTRIES, "epic_id");
    expect(groups.get("EP-001")).toHaveLength(2);
    expect(groups.get("EP-002")).toHaveLength(1);
    expect(groups.get("unset")).toHaveLength(1);
  });
});

describe("queryIndex", () => {
  it("filters and sorts", () => {
    const result = queryIndex(ENTRIES, {
      filters: { area: "web" },
      sort: "priority",
    });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("TASK-001"); // high
  });
});

describe("findById", () => {
  it("finds existing entry", () => {
    expect(findById(ENTRIES, "TASK-002")?.title).toBe("회원가입 API");
  });

  it("returns undefined for missing id", () => {
    expect(findById(ENTRIES, "TASK-999")).toBeUndefined();
  });
});

describe("findSimilarIds", () => {
  it("finds similar IDs", () => {
    const similar = findSimilarIds(ENTRIES, "TASK-00");
    expect(similar.length).toBeGreaterThan(0);
    expect(similar).toContain("TASK-001");
  });

  it("returns empty for no matches", () => {
    expect(findSimilarIds(ENTRIES, "XYZ")).toHaveLength(0);
  });
});
