#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TaskStore } from "./store.js";

const PROJECT_DIR = process.env.SIRA_PROJECT_DIR || process.cwd();

const server = new McpServer({
  name: "sira",
  version: "0.1.0",
});

const store = new TaskStore(PROJECT_DIR);

// === Tools ===

server.tool(
  "sira_list_tasks",
  "내 할당 태스크 목록 조회. assignee 미지정 시 전체 목록 반환",
  {
    assignee: z.string().optional().describe("할당자 이름 (예: 'suwon', 'claude-1')"),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).optional().describe("상태 필터"),
    epic: z.string().optional().describe("에픽 ID 필터 (예: 'EP-001')"),
    priority: z.enum(["critical", "high", "medium", "low"]).optional().describe("우선순위 필터"),
  },
  async ({ assignee, status, epic, priority }) => {
    await store.load();
    let tasks = store.getAllTasks();

    if (assignee) tasks = tasks.filter((t) => t.assignee === assignee);
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (epic) tasks = tasks.filter((t) => t.epic_id === epic);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);

    const summary = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee,
      epic_id: t.epic_id,
      due_date: t.due_date,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text: `총 ${summary.length}개 태스크\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "sira_get_task",
  "특정 태스크의 전체 .md 파일 내용 다운로드",
  {
    task_id: z.string().describe("태스크 ID (예: 'SIRA-001')"),
  },
  async ({ task_id }) => {
    await store.load();
    const result = store.getTaskRaw(task_id);

    if (!result) {
      return {
        content: [{ type: "text" as const, text: `태스크 '${task_id}'를 찾을 수 없습니다.` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: result.content,
        },
      ],
    };
  }
);

server.tool(
  "sira_update_status",
  "태스크 상태 변경 (backlog → todo → in_progress → in_review → done)",
  {
    task_id: z.string().describe("태스크 ID"),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).describe("변경할 상태"),
    progress: z.number().min(0).max(100).optional().describe("진행률 (0-100)"),
    comment: z.string().optional().describe("상태 변경 사유"),
  },
  async ({ task_id, status, progress, comment }) => {
    await store.load();
    const result = await store.updateTaskStatus(task_id, status, progress, comment);

    if (!result.success) {
      return {
        content: [{ type: "text" as const, text: result.error! }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `${task_id} 상태 변경 완료: → ${status}${progress !== undefined ? ` (진행률: ${progress}%)` : ""}`,
        },
      ],
    };
  }
);

server.tool(
  "sira_get_epic",
  "에픽 상세 정보 및 하위 태스크 목록 조회",
  {
    epic_id: z.string().describe("에픽 ID (예: 'EP-001')"),
  },
  async ({ epic_id }) => {
    await store.load();
    const epic = store.getEpic(epic_id);

    if (!epic) {
      return {
        content: [{ type: "text" as const, text: `에픽 '${epic_id}'를 찾을 수 없습니다.` }],
        isError: true,
      };
    }

    const tasks = store.getTasksByEpic(epic_id);
    const done = tasks.filter((t) => t.status === "done").length;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              ...epic,
              progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
              tasks: tasks.map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                assignee: t.assignee,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "sira_query",
  "자연어 또는 필터 조건으로 태스크 검색",
  {
    query: z.string().describe("검색어 (태스크 제목/설명에서 검색) 또는 필터 (예: 'status:in_progress assignee:suwon')"),
  },
  async ({ query }) => {
    await store.load();

    // 간단한 필터 파싱: key:value 형태
    const filters: Record<string, string> = {};
    let searchText = query;

    const filterRegex = /(\w+):(\S+)/g;
    let match;
    while ((match = filterRegex.exec(query)) !== null) {
      filters[match[1]] = match[2];
      searchText = searchText.replace(match[0], "").trim();
    }

    let tasks = store.getAllTasks();

    // 필터 적용
    if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters.assignee) tasks = tasks.filter((t) => t.assignee === filters.assignee);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    if (filters.epic) tasks = tasks.filter((t) => t.epic_id === filters.epic);
    if (filters.type) tasks = tasks.filter((t) => t.type === filters.type);
    if (filters.tag) tasks = tasks.filter((t) => t.tags?.includes(filters.tag));

    // 텍스트 검색
    if (searchText) {
      const lower = searchText.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description?.toLowerCase().includes(lower) ||
          t.id.toLowerCase().includes(lower)
      );
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `검색 결과: ${tasks.length}개\n\n${JSON.stringify(
            tasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              assignee: t.assignee,
            })),
            null,
            2
          )}`,
        },
      ],
    };
  }
);

server.tool(
  "sira_create_task",
  "새 태스크 생성 (.md 파일 생성)",
  {
    title: z.string().describe("태스크 제목"),
    description: z.string().optional().describe("태스크 설명 (마크다운)"),
    epic_id: z.string().describe("소속 에픽 ID"),
    assignee: z.string().optional().describe("할당자"),
    priority: z.enum(["critical", "high", "medium", "low"]).default("medium").describe("우선순위"),
    type: z.enum(["feature", "bug", "chore", "spike"]).default("feature").describe("태스크 유형"),
    tags: z.array(z.string()).optional().describe("태그 목록"),
    due_date: z.string().optional().describe("마감일 (YYYY-MM-DD)"),
  },
  async ({ title, description, epic_id, assignee, priority, type, tags, due_date }) => {
    await store.load();
    const result = await store.createTask({
      title,
      description: description || "",
      epic_id,
      assignee: assignee || "unassigned",
      priority,
      type,
      tags: tags || [],
      due_date,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `태스크 생성 완료: ${result.id} - ${title}\n파일: ${result.filePath}`,
        },
      ],
    };
  }
);

server.tool(
  "sira_list_epics",
  "전체 에픽 목록 및 진행률 조회",
  {},
  async () => {
    await store.load();
    const epics = store.getAllEpics();
    const allTasks = store.getAllTasks();

    const result = epics.map((epic) => {
      const epicTasks = allTasks.filter((t) => t.epic_id === epic.id);
      const done = epicTasks.filter((t) => t.status === "done").length;
      return {
        id: epic.id,
        title: epic.title,
        total_tasks: epicTasks.length,
        done,
        progress: epicTasks.length > 0 ? Math.round((done / epicTasks.length) * 100) : 0,
      };
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `에픽 ${result.length}개\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "sira_team_status",
  "팀 멤버별 할당 현황 조회",
  {},
  async () => {
    await store.load();
    const tasks = store.getAllTasks();

    const byAssignee: Record<string, { total: number; done: number; in_progress: number; backlog: number }> = {};

    for (const task of tasks) {
      const a = task.assignee || "unassigned";
      if (!byAssignee[a]) byAssignee[a] = { total: 0, done: 0, in_progress: 0, backlog: 0 };
      byAssignee[a].total++;
      if (task.status === "done") byAssignee[a].done++;
      else if (task.status === "in_progress") byAssignee[a].in_progress++;
      else byAssignee[a].backlog++;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `팀 현황\n\n${JSON.stringify(byAssignee, null, 2)}`,
        },
      ],
    };
  }
);

// === Start Server ===

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SIRA MCP Server started (project: " + PROJECT_DIR + ")");
}

main().catch((err) => {
  console.error("Failed to start SIRA MCP server:", err);
  process.exit(1);
});
