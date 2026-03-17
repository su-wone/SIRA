import { Octokit } from "@octokit/rest";
import { parseMarkdown, stringifyMarkdown } from "@sira/core";
import type { IndexEntry } from "@sira/core";
import yaml from "js-yaml";

const owner = process.env.GITHUB_OWNER ?? "su-wone";
const repo = process.env.GITHUB_REPO ?? "SIRA";

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return new Octokit({ auth: token });
}

export function isGitHubMode(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

// --- Cache (in-memory, per serverless instance) ---

let cachedTasks: { entries: IndexEntry[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30_000; // 30 seconds

export function invalidateCache() {
  cachedTasks = null;
}

// --- Read files from GitHub ---

async function fetchDirectoryRecursive(
  octokit: Octokit,
  dirPath: string,
): Promise<{ path: string; download_url: string }[]> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: dirPath });
    if (!Array.isArray(data)) return [];

    const files: { path: string; download_url: string }[] = [];
    for (const item of data) {
      if (item.type === "file" && item.name.endsWith(".md")) {
        files.push({ path: item.path, download_url: item.download_url! });
      } else if (item.type === "dir") {
        const subFiles = await fetchDirectoryRecursive(octokit, item.path);
        files.push(...subFiles);
      }
    }
    return files;
  } catch {
    return [];
  }
}

async function fetchFileContent(octokit: Octokit, filePath: string): Promise<string> {
  const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
  if (Array.isArray(data) || data.type !== "file") {
    throw new Error(`Not a file: ${filePath}`);
  }
  return Buffer.from(data.content, "base64").toString("utf-8");
}

// --- Public API ---

export async function fetchAllTasks(): Promise<IndexEntry[]> {
  if (cachedTasks && Date.now() - cachedTasks.fetchedAt < CACHE_TTL_MS) {
    return cachedTasks.entries;
  }

  const octokit = getOctokit();
  const files = await fetchDirectoryRecursive(octokit, "tasks");

  const entries: IndexEntry[] = [];
  for (const file of files) {
    try {
      const raw = await fetchFileContent(octokit, file.path);
      const { data } = parseMarkdown(raw);

      if (!data.id || !data.title) continue;

      entries.push({
        id: data.id as string,
        title: data.title as string,
        status: (data.status as string) ?? "backlog",
        assignee: data.assignee as string | undefined,
        priority: (data.priority as string) ?? "medium",
        area: data.area as string | undefined,
        epic_id: data.epic_id as string | undefined,
        story_id: data.story_id as string | undefined,
        related_files: (data.related_files as string[]) ?? [],
        tags: (data.tags as string[]) ?? [],
        start_date: data.start_date as string | undefined,
        due_date: data.due_date as string | undefined,
        created_at: (data.created_at as string) ?? new Date().toISOString(),
        updated_at: (data.updated_at as string) ?? new Date().toISOString(),
        file_path: file.path,
        file_mtime: new Date().toISOString(),
      });
    } catch {
      // Skip invalid files
    }
  }

  cachedTasks = { entries, fetchedAt: Date.now() };
  return entries;
}

export async function fetchTask(id: string): Promise<{ entry: IndexEntry; content: string } | null> {
  const entries = await fetchAllTasks();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return null;

  const octokit = getOctokit();
  const raw = await fetchFileContent(octokit, entry.file_path);
  const { content } = parseMarkdown(raw);

  return { entry, content: content.trim() };
}

export async function updateTask(
  id: string,
  updates: Record<string, unknown>,
): Promise<{ id: string } & Record<string, unknown>> {
  const entries = await fetchAllTasks();
  const entry = entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Task not found: ${id}`);

  const octokit = getOctokit();
  const filePath = entry.file_path;

  // Get current file (need sha for update)
  const { data: fileData } = await octokit.repos.getContent({ owner, repo, path: filePath });
  if (Array.isArray(fileData) || fileData.type !== "file") {
    throw new Error(`Not a file: ${filePath}`);
  }

  const raw = Buffer.from(fileData.content, "base64").toString("utf-8");
  const { data, content } = parseMarkdown(raw);

  // Apply updates
  for (const [key, value] of Object.entries(updates)) {
    data[key] = value;
  }
  data.updated_at = new Date().toISOString().split("T")[0];

  const newContent = stringifyMarkdown(data, content);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `chore: update task ${id}`,
    content: Buffer.from(newContent).toString("base64"),
    sha: fileData.sha,
  });

  invalidateCache();
  return { id, ...updates };
}

export async function fetchTeam(): Promise<
  { name: string; role: string; type: string; github_username?: string }[]
> {
  try {
    const octokit = getOctokit();
    const raw = await fetchFileContent(octokit, ".sira/config.yaml");
    const config = yaml.load(raw) as { team?: { name: string; role: string; type: string; github_username?: string }[] };
    return config.team ?? [];
  } catch {
    return [];
  }
}
