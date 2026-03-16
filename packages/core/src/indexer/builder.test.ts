import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  buildIndex,
  writeIndex,
  readIndex,
  incrementalUpdate,
  validateIndex,
  rebuildIfCorrupt,
} from "./builder.js";

function createTempProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sira-test-"));
  fs.mkdirSync(path.join(dir, "tasks", "epics"), { recursive: true });
  fs.mkdirSync(path.join(dir, "tasks", "web"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".sira"), { recursive: true });
  return dir;
}

function writeTask(projectRoot: string, relativePath: string, frontmatter: Record<string, unknown>, body = ""): void {
  const fullPath = path.join(projectRoot, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push("---", "", body);
  fs.writeFileSync(fullPath, lines.join("\n"), "utf-8");
}

let tempDir: string;

beforeEach(() => {
  tempDir = createTempProject();
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("buildIndex", () => {
  it("builds index from task .md files", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "로그인 개발",
      status: "todo",
      priority: "high",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    writeTask(tempDir, "tasks/web/TASK-002.md", {
      id: "TASK-002",
      title: "회원가입 개발",
      status: "backlog",
      priority: "medium",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });

    const index = buildIndex(tempDir);
    expect(index.entries).toHaveLength(2);
    expect(index.entries.map((e) => e.id).sort()).toEqual(["TASK-001", "TASK-002"]);
    expect(index.version).toBe("1");
  });

  it("skips files without id/title", () => {
    writeTask(tempDir, "tasks/web/README.md", {}, "Just a readme");
    const index = buildIndex(tempDir);
    expect(index.entries).toHaveLength(0);
  });

  it("skips files with invalid schema", () => {
    writeTask(tempDir, "tasks/web/TASK-BAD.md", {
      id: "TASK-BAD",
      title: "Bad task",
      status: "nonexistent_status",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    const index = buildIndex(tempDir);
    expect(index.entries).toHaveLength(0);
  });

  it("handles empty tasks directory", () => {
    const index = buildIndex(tempDir);
    expect(index.entries).toHaveLength(0);
  });
});

describe("writeIndex / readIndex", () => {
  it("writes and reads index", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "테스트",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    const index = buildIndex(tempDir);
    writeIndex(tempDir, index);

    const read = readIndex(tempDir);
    expect(read).not.toBeNull();
    expect(read!.entries).toHaveLength(1);
    expect(read!.entries[0].id).toBe("TASK-001");
  });

  it("returns null when no index exists", () => {
    const noSiraDir = fs.mkdtempSync(path.join(os.tmpdir(), "sira-empty-"));
    const result = readIndex(noSiraDir);
    expect(result).toBeNull();
    fs.rmSync(noSiraDir, { recursive: true, force: true });
  });
});

describe("incrementalUpdate", () => {
  it("falls back to full build when no existing index", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "테스트",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    const index = incrementalUpdate(tempDir);
    expect(index.entries).toHaveLength(1);
  });

  it("keeps unchanged entries and re-parses modified files", async () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "원래 제목",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });

    const index1 = buildIndex(tempDir);
    writeIndex(tempDir, index1);

    // Wait a tick to ensure mtime changes
    await new Promise((r) => setTimeout(r, 50));

    // Modify the file
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "수정된 제목",
      created_at: "2026-03-12",
      updated_at: "2026-03-13",
    });

    const index2 = incrementalUpdate(tempDir);
    expect(index2.entries).toHaveLength(1);
    expect(index2.entries[0].title).toBe("수정된 제목");
  });

  it("removes deleted files from index", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "삭제될 태스크",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    writeTask(tempDir, "tasks/web/TASK-002.md", {
      id: "TASK-002",
      title: "남을 태스크",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });

    const index1 = buildIndex(tempDir);
    writeIndex(tempDir, index1);

    // Delete one file
    fs.unlinkSync(path.join(tempDir, "tasks/web/TASK-001.md"));

    const index2 = incrementalUpdate(tempDir);
    expect(index2.entries).toHaveLength(1);
    expect(index2.entries[0].id).toBe("TASK-002");
  });
});

describe("validateIndex", () => {
  it("returns true when index matches files", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "테스트",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    const index = buildIndex(tempDir);
    writeIndex(tempDir, index);

    expect(validateIndex(tempDir)).toBe(true);
  });

  it("returns false when file added", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "테스트",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    const index = buildIndex(tempDir);
    writeIndex(tempDir, index);

    writeTask(tempDir, "tasks/web/TASK-002.md", {
      id: "TASK-002",
      title: "새 태스크",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });

    expect(validateIndex(tempDir)).toBe(false);
  });

  it("returns false when no index exists", () => {
    expect(validateIndex(tempDir)).toBe(false);
  });
});

describe("rebuildIfCorrupt", () => {
  it("rebuilds index when corrupt", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "테스트",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });

    // Write empty/corrupt index
    fs.writeFileSync(
      path.join(tempDir, ".sira", "index.json"),
      JSON.stringify({ version: "1", generated_at: "", entries: [] }),
      "utf-8",
    );

    const index = rebuildIfCorrupt(tempDir);
    expect(index.entries).toHaveLength(1);
    expect(index.entries[0].id).toBe("TASK-001");
  });

  it("keeps valid index", () => {
    writeTask(tempDir, "tasks/web/TASK-001.md", {
      id: "TASK-001",
      title: "테스트",
      created_at: "2026-03-12",
      updated_at: "2026-03-12",
    });
    const index = buildIndex(tempDir);
    writeIndex(tempDir, index);

    const result = rebuildIfCorrupt(tempDir);
    expect(result.entries).toHaveLength(1);
  });
});
