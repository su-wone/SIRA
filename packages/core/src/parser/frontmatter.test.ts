import { describe, it, expect } from "vitest";
import { parseMarkdown, parseAndValidate, stringifyMarkdown } from "./frontmatter.js";
import { taskSchema } from "../schema/index.js";
import { SchemaValidationError } from "../errors/index.js";

const VALID_TASK_MD = `---
id: TASK-001
title: 로그인 화면 개발
status: todo
assignee: 지영
priority: high
area: web
related_files:
  - src/app/login/page.tsx
tags:
  - auth
created_at: "2026-03-12"
updated_at: "2026-03-12"
---

## 설명

로그인 화면을 개발합니다.
`;

const INVALID_TASK_MD = `---
title: 제목만 있는 태스크
status: invalid_status
---

본문
`;

describe("parseMarkdown", () => {
  it("parses frontmatter and content", () => {
    const { data, content } = parseMarkdown(VALID_TASK_MD);
    expect(data.id).toBe("TASK-001");
    expect(data.title).toBe("로그인 화면 개발");
    expect(content).toContain("로그인 화면을 개발합니다.");
  });

  it("handles no frontmatter", () => {
    const { data, content } = parseMarkdown("# Just markdown");
    expect(Object.keys(data)).toHaveLength(0);
    expect(content).toContain("Just markdown");
  });
});

describe("parseAndValidate", () => {
  it("parses and validates a correct task", () => {
    const { data, content } = parseAndValidate(VALID_TASK_MD, taskSchema);
    expect(data.id).toBe("TASK-001");
    expect(data.status).toBe("todo");
    expect(data.related_files).toEqual(["src/app/login/page.tsx"]);
    expect(content).toContain("로그인 화면을 개발합니다.");
  });

  it("throws SchemaValidationError for invalid frontmatter", () => {
    expect(() => parseAndValidate(INVALID_TASK_MD, taskSchema)).toThrow(
      SchemaValidationError,
    );
  });

  it("SchemaValidationError contains issues array", () => {
    try {
      parseAndValidate(INVALID_TASK_MD, taskSchema);
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const err = e as SchemaValidationError;
      expect(err.code).toBe("SCHEMA_VALIDATION_ERROR");
      expect(err.issues.length).toBeGreaterThan(0);
    }
  });
});

describe("stringifyMarkdown", () => {
  it("converts data + content back to markdown with frontmatter", () => {
    const data = { id: "TASK-002", title: "테스트" };
    const content = "## 설명\n\n테스트입니다.";
    const result = stringifyMarkdown(data, content);
    expect(result).toContain("id: TASK-002");
    expect(result).toContain("title: 테스트");
    expect(result).toContain("테스트입니다.");
  });
});
