import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  epic_id: string;
  assignee: string;
  created_at: string;
  start_date?: string;
  due_date?: string;
  progress: number;
  tags: string[];
  [key: string]: unknown;
}

export interface EpicData {
  id: string;
  title: string;
  description: string;
  color?: string;
}

interface RawFile {
  filePath: string;
  content: string;
  data: Record<string, unknown>;
  body: string;
}

export class TaskStore {
  private projectDir: string;
  private tasksDir: string;
  private epicsDir: string;
  private tasks: Map<string, { task: TaskData; raw: RawFile }> = new Map();
  private epics: Map<string, { epic: EpicData; raw: RawFile }> = new Map();
  private loaded = false;

  constructor(projectDir: string) {
    this.projectDir = projectDir;
    this.tasksDir = path.join(projectDir, "tasks");
    this.epicsDir = path.join(projectDir, "tasks", "epics");
  }

  async load(): Promise<void> {
    this.tasks.clear();
    this.epics.clear();

    await this.ensureDirs();
    await this.loadEpics();
    await this.loadTasks();
    this.loaded = true;
  }

  private async ensureDirs(): Promise<void> {
    await fs.mkdir(this.tasksDir, { recursive: true });
    await fs.mkdir(this.epicsDir, { recursive: true });
  }

  private async loadTasks(): Promise<void> {
    const files = await this.findMdFiles(this.tasksDir);
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const parsed = matter(content);
        const data = parsed.data as Record<string, unknown>;

        const task: TaskData = {
          id: (data.id as string) || path.basename(filePath, ".md"),
          title: (data.title as string) || "",
          description: parsed.content.trim(),
          status: (data.status as string) || "backlog",
          priority: (data.priority as string) || "medium",
          type: (data.type as string) || "feature",
          epic_id: (data.epic_id as string) || "",
          assignee: (data.assignee as string) || "unassigned",
          created_at: (data.created_at as string) || new Date().toISOString().split("T")[0],
          start_date: data.start_date as string | undefined,
          due_date: data.due_date as string | undefined,
          progress: (data.progress as number) || 0,
          tags: (data.tags as string[]) || [],
        };

        this.tasks.set(task.id, {
          task,
          raw: { filePath, content, data, body: parsed.content },
        });
      } catch {
        // skip invalid files
      }
    }
  }

  private async loadEpics(): Promise<void> {
    const files = await this.findMdFiles(this.epicsDir);
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const parsed = matter(content);
        const data = parsed.data as Record<string, unknown>;

        const epic: EpicData = {
          id: (data.id as string) || path.basename(filePath, ".md"),
          title: (data.title as string) || "",
          description: parsed.content.trim(),
          color: data.color as string | undefined,
        };

        this.epics.set(epic.id, {
          epic,
          raw: { filePath, content, data, body: parsed.content },
        });
      } catch {
        // skip invalid files
      }
    }
  }

  private async findMdFiles(dir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
      return entries
        .filter((e) => e.isFile() && e.name.endsWith(".md"))
        .map((e) => path.join(e.parentPath || dir, e.name));
    } catch {
      return [];
    }
  }

  // === Query Methods ===

  getAllTasks(): TaskData[] {
    return Array.from(this.tasks.values()).map((v) => v.task);
  }

  getTask(id: string): TaskData | undefined {
    return this.tasks.get(id)?.task;
  }

  getTaskRaw(id: string): { content: string; filePath: string } | undefined {
    const entry = this.tasks.get(id);
    if (!entry) return undefined;
    return { content: entry.raw.content, filePath: entry.raw.filePath };
  }

  getAllEpics(): EpicData[] {
    return Array.from(this.epics.values()).map((v) => v.epic);
  }

  getEpic(id: string): EpicData | undefined {
    return this.epics.get(id)?.epic;
  }

  getTasksByEpic(epicId: string): TaskData[] {
    return this.getAllTasks().filter((t) => t.epic_id === epicId);
  }

  // === Mutation Methods ===

  async updateTaskStatus(
    taskId: string,
    status: string,
    progress?: number,
    comment?: string
  ): Promise<{ success: boolean; error?: string }> {
    const entry = this.tasks.get(taskId);
    if (!entry) return { success: false, error: `태스크 '${taskId}'를 찾을 수 없습니다.` };

    const parsed = matter(entry.raw.content);
    parsed.data.status = status;
    if (progress !== undefined) parsed.data.progress = progress;
    parsed.data.updated_at = new Date().toISOString().split("T")[0];

    // 상태 변경 로그를 본문에 추가
    if (comment) {
      const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
      const logEntry = `\n\n---\n**[${timestamp}]** 상태 → ${status}: ${comment}`;
      parsed.content = parsed.content + logEntry;
    }

    const newContent = matter.stringify(parsed.content, parsed.data);
    await fs.writeFile(entry.raw.filePath, newContent, "utf-8");

    // 메모리 업데이트
    entry.task.status = status;
    if (progress !== undefined) entry.task.progress = progress;
    entry.raw.content = newContent;

    return { success: true };
  }

  async createTask(input: {
    title: string;
    description: string;
    epic_id: string;
    assignee: string;
    priority: string;
    type: string;
    tags: string[];
    due_date?: string;
  }): Promise<{ id: string; filePath: string }> {
    // 다음 ID 생성
    const existingIds = Array.from(this.tasks.keys())
      .map((id) => {
        const match = id.match(/SIRA-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const id = `SIRA-${String(nextNum).padStart(3, "0")}`;

    const today = new Date().toISOString().split("T")[0];

    const frontmatter: Record<string, unknown> = {
      id,
      title: input.title,
      status: "backlog",
      priority: input.priority,
      type: input.type,
      epic_id: input.epic_id,
      assignee: input.assignee,
      created_at: today,
      progress: 0,
      tags: input.tags,
    };

    if (input.due_date) frontmatter.due_date = input.due_date;

    const content = matter.stringify(input.description ? `\n${input.description}` : "\n", frontmatter);

    // 파일명: SIRA-001-title-slug.md
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
    const fileName = `${id}-${slug}.md`;
    const filePath = path.join(this.tasksDir, fileName);

    await fs.writeFile(filePath, content, "utf-8");

    // 메모리에 추가
    const task: TaskData = {
      id,
      title: input.title,
      description: input.description,
      status: "backlog",
      priority: input.priority,
      type: input.type,
      epic_id: input.epic_id,
      assignee: input.assignee,
      created_at: today,
      progress: 0,
      tags: input.tags,
      due_date: input.due_date,
    };

    this.tasks.set(id, {
      task,
      raw: { filePath, content, data: frontmatter, body: input.description },
    });

    return { id, filePath };
  }
}
