import { describe, it, expect } from "vitest";
import { fieldLevelMerge, mergeOrThrow } from "./merge.js";
import { SyncConflictError } from "../errors/index.js";

describe("fieldLevelMerge", () => {
  it("merges non-conflicting changes", () => {
    const base = { status: "todo", priority: "medium", assignee: "지영" };
    const local = { status: "in_progress", priority: "medium", assignee: "지영" };
    const remote = { status: "todo", priority: "high", assignee: "지영" };

    const { merged, conflicts } = fieldLevelMerge(base, local, remote);
    expect(conflicts).toHaveLength(0);
    expect(merged.status).toBe("in_progress");
    expect(merged.priority).toBe("high");
    expect(merged.assignee).toBe("지영");
  });

  it("detects conflicting changes on same field", () => {
    const base = { status: "todo" };
    const local = { status: "in_progress" };
    const remote = { status: "review" };

    const { conflicts } = fieldLevelMerge(base, local, remote);
    expect(conflicts).toContain("status");
  });

  it("handles new fields added by one side", () => {
    const base = { status: "todo" };
    const local = { status: "todo", tags: ["auth"] };
    const remote = { status: "todo" };

    const { merged, conflicts } = fieldLevelMerge(base, local, remote);
    expect(conflicts).toHaveLength(0);
    expect(merged.tags).toEqual(["auth"]);
  });

  it("handles fields removed by one side", () => {
    const base = { status: "todo", assignee: "지영" };
    const local = { status: "todo" };
    const remote = { status: "todo", assignee: "지영" };

    const { merged, conflicts } = fieldLevelMerge(base, local, remote);
    expect(conflicts).toHaveLength(0);
    expect(merged.assignee).toBeUndefined();
  });

  it("both agree on same change — no conflict", () => {
    const base = { status: "todo" };
    const local = { status: "done" };
    const remote = { status: "done" };

    const { merged, conflicts } = fieldLevelMerge(base, local, remote);
    expect(conflicts).toHaveLength(0);
    expect(merged.status).toBe("done");
  });
});

describe("mergeOrThrow", () => {
  it("returns merged data when no conflicts", () => {
    const base = { a: 1, b: 2 };
    const local = { a: 10, b: 2 };
    const remote = { a: 1, b: 20 };

    const result = mergeOrThrow(base, local, remote);
    expect(result).toEqual({ a: 10, b: 20 });
  });

  it("throws SyncConflictError on conflict", () => {
    const base = { a: 1 };
    const local = { a: 2 };
    const remote = { a: 3 };

    expect(() => mergeOrThrow(base, local, remote)).toThrow(SyncConflictError);
  });
});
