import { describe, it, expect } from "vitest";
import { verifyGitHubSignature, extractChangedTaskFiles } from "./webhook.js";
import crypto from "node:crypto";

describe("verifyGitHubSignature", () => {
  const secret = "test-secret";
  const payload = '{"action":"push"}';

  it("accepts valid signature", () => {
    const sig = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
    expect(verifyGitHubSignature(payload, sig, secret)).toBe(true);
  });

  it("rejects invalid signature", () => {
    expect(verifyGitHubSignature(payload, "sha256=invalid", secret)).toBe(false);
  });

  it("rejects null signature", () => {
    expect(verifyGitHubSignature(payload, null, secret)).toBe(false);
  });
});

describe("extractChangedTaskFiles", () => {
  it("extracts task .md files from commits", () => {
    const payload = {
      ref: "refs/heads/main",
      commits: [
        {
          id: "abc123",
          message: "update tasks",
          added: ["tasks/web/TASK-001.md", "src/app.ts"],
          modified: ["tasks/server/TASK-002.md"],
          removed: ["tasks/shared/TASK-003.md"],
        },
      ],
    };

    const result = extractChangedTaskFiles(payload);
    expect(result.added).toEqual(["tasks/web/TASK-001.md"]);
    expect(result.modified).toEqual(["tasks/server/TASK-002.md"]);
    expect(result.removed).toEqual(["tasks/shared/TASK-003.md"]);
  });

  it("deduplicates across commits", () => {
    const payload = {
      ref: "refs/heads/main",
      commits: [
        { id: "a", message: "", added: ["tasks/web/TASK-001.md"], modified: [], removed: [] },
        { id: "b", message: "", added: ["tasks/web/TASK-001.md"], modified: [], removed: [] },
      ],
    };

    const result = extractChangedTaskFiles(payload);
    expect(result.added).toHaveLength(1);
  });

  it("ignores non-task files", () => {
    const payload = {
      ref: "refs/heads/main",
      commits: [
        { id: "a", message: "", added: ["src/index.ts", "README.md"], modified: [], removed: [] },
      ],
    };

    const result = extractChangedTaskFiles(payload);
    expect(result.added).toHaveLength(0);
  });
});
