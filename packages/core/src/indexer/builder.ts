import fs from "node:fs";
import path from "node:path";
import { parseMarkdown } from "../parser/frontmatter.js";
import { taskSchema } from "../schema/task.schema.js";
import { IndexCorruptError } from "../errors/index.js";
import type { IndexEntry, IndexFile } from "../types/index.types.js";

const INDEX_VERSION = "1";

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function fileToEntry(filePath: string, projectRoot: string): IndexEntry | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = parseMarkdown(raw);

    // Skip files without id (not a task file)
    if (!data.id || !data.title) return null;

    const result = taskSchema.safeParse(data);
    if (!result.success) return null;

    const stat = fs.statSync(filePath);
    const relativePath = path.relative(projectRoot, filePath);

    return {
      ...result.data,
      file_path: relativePath,
      file_mtime: stat.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

export function buildIndex(projectRoot: string): IndexFile {
  const tasksDir = path.join(projectRoot, "tasks");
  const files = findMarkdownFiles(tasksDir);
  const entries: IndexEntry[] = [];

  for (const file of files) {
    const entry = fileToEntry(file, projectRoot);
    if (entry) entries.push(entry);
  }

  return {
    version: INDEX_VERSION,
    generated_at: new Date().toISOString(),
    entries,
  };
}

export function writeIndex(projectRoot: string, index: IndexFile): void {
  const siraDir = path.join(projectRoot, ".sira");
  if (!fs.existsSync(siraDir)) {
    fs.mkdirSync(siraDir, { recursive: true });
  }
  const indexPath = path.join(siraDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
}

export function readIndex(projectRoot: string): IndexFile | null {
  const indexPath = path.join(projectRoot, ".sira", "index.json");
  if (!fs.existsSync(indexPath)) return null;

  try {
    const raw = fs.readFileSync(indexPath, "utf-8");
    return JSON.parse(raw) as IndexFile;
  } catch {
    return null;
  }
}

export function incrementalUpdate(projectRoot: string): IndexFile {
  const existing = readIndex(projectRoot);
  if (!existing) {
    return buildIndex(projectRoot);
  }

  const tasksDir = path.join(projectRoot, "tasks");
  const files = findMarkdownFiles(tasksDir);

  // Build lookup of existing entries by file_path
  const existingMap = new Map<string, IndexEntry>();
  for (const entry of existing.entries) {
    existingMap.set(entry.file_path, entry);
  }

  // Track current file paths to detect deletions
  const currentPaths = new Set<string>();
  const newEntries: IndexEntry[] = [];

  for (const file of files) {
    const relativePath = path.relative(projectRoot, file);
    currentPaths.add(relativePath);

    const stat = fs.statSync(file);
    const mtime = stat.mtime.toISOString();
    const existingEntry = existingMap.get(relativePath);

    if (existingEntry && existingEntry.file_mtime === mtime) {
      // File unchanged — keep existing entry
      newEntries.push(existingEntry);
    } else {
      // File new or modified — re-parse
      const entry = fileToEntry(file, projectRoot);
      if (entry) newEntries.push(entry);
    }
  }

  const index: IndexFile = {
    version: INDEX_VERSION,
    generated_at: new Date().toISOString(),
    entries: newEntries,
  };

  return index;
}

export function validateIndex(projectRoot: string): boolean {
  const existing = readIndex(projectRoot);
  if (!existing) return false;

  const tasksDir = path.join(projectRoot, "tasks");
  const files = findMarkdownFiles(tasksDir);
  const currentPaths = new Set(
    files.map((f) => path.relative(projectRoot, f)),
  );
  const indexedPaths = new Set(existing.entries.map((e) => e.file_path));

  // Check if file sets match
  if (currentPaths.size !== indexedPaths.size) return false;
  for (const p of currentPaths) {
    if (!indexedPaths.has(p)) return false;
  }
  return true;
}

export function rebuildIfCorrupt(projectRoot: string): IndexFile {
  if (!validateIndex(projectRoot)) {
    const index = buildIndex(projectRoot);
    writeIndex(projectRoot, index);
    return index;
  }
  const existing = readIndex(projectRoot);
  if (!existing) {
    throw new IndexCorruptError("Index file missing after validation passed");
  }
  return existing;
}
