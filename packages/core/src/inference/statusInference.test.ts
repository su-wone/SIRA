import { describe, it, expect } from "vitest";
import { inferStatus, type GitActivity } from "./statusInference.js";

const baseActivity: GitActivity = {
  taskId: "TASK-001",
  relatedFiles: ["src/app/login/page.tsx"],
  recentCommits: [],
  openPRs: [],
  mergedPRs: [],
};

describe("inferStatus", () => {
  it("suggests done when PR is merged", () => {
    const activity: GitActivity = {
      ...baseActivity,
      mergedPRs: [{ number: 42, title: "Add login", mergedAt: "2026-03-15" }],
    };
    const result = inferStatus(activity, "in_progress");
    expect(result?.suggestedStatus).toBe("done");
    expect(result?.evidence[0].type).toBe("merged_pr");
  });

  it("suggests review when PR is open", () => {
    const activity: GitActivity = {
      ...baseActivity,
      openPRs: [{ number: 43, title: "WIP: login", state: "open" }],
    };
    const result = inferStatus(activity, "in_progress");
    expect(result?.suggestedStatus).toBe("review");
  });

  it("suggests in_progress when related files have commits", () => {
    const activity: GitActivity = {
      ...baseActivity,
      recentCommits: [
        { hash: "abc1234", message: "update login page", date: "2026-03-14", files: ["src/app/login/page.tsx"] },
      ],
    };
    const result = inferStatus(activity, "todo");
    expect(result?.suggestedStatus).toBe("in_progress");
    expect(result?.evidence[0].type).toBe("commit");
  });

  it("returns null when no inference possible", () => {
    const result = inferStatus(baseActivity, "todo");
    expect(result).toBeNull();
  });

  it("does not suggest done if already done", () => {
    const activity: GitActivity = {
      ...baseActivity,
      mergedPRs: [{ number: 42, title: "Add login", mergedAt: "2026-03-15" }],
    };
    const result = inferStatus(activity, "done");
    expect(result).toBeNull();
  });

  it("does not suggest review if already done", () => {
    const activity: GitActivity = {
      ...baseActivity,
      openPRs: [{ number: 43, title: "WIP", state: "open" }],
    };
    const result = inferStatus(activity, "done");
    expect(result).toBeNull();
  });

  it("prioritizes merged PR over open PR", () => {
    const activity: GitActivity = {
      ...baseActivity,
      openPRs: [{ number: 43, title: "WIP", state: "open" }],
      mergedPRs: [{ number: 42, title: "Done", mergedAt: "2026-03-15" }],
    };
    const result = inferStatus(activity, "in_progress");
    expect(result?.suggestedStatus).toBe("done");
  });
});
