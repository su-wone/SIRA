import { NextResponse } from "next/server";
import { isGitHubMode, fetchTask, updateTask } from "@/lib/github";
import {
  rebuildIfCorrupt,
  findById,
  parseMarkdown,
  stringifyMarkdown,
  incrementalUpdate,
  writeIndex,
} from "@sira/core";
import fs from "node:fs";
import path from "node:path";

function getProjectRoot(): string {
  return process.env.SIRA_PROJECT_ROOT ?? process.cwd();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (isGitHubMode()) {
      const result = await fetchTask(id);
      if (!result) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `태스크를 찾을 수 없습니다: ${id}` } },
          { status: 404 },
        );
      }
      return NextResponse.json({ data: { ...result.entry, content: result.content } });
    }

    // Local filesystem mode
    const root = getProjectRoot();
    const index = rebuildIfCorrupt(root);
    const entry = findById(index.entries, id);

    if (!entry) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `태스크를 찾을 수 없습니다: ${id}` } },
        { status: 404 },
      );
    }

    let content = "";
    const filePath = path.join(root, entry.file_path);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = parseMarkdown(raw);
      content = parsed.content.trim();
    }

    return NextResponse.json({ data: { ...entry, content } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: { code: "INTERNAL", message } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    if (isGitHubMode()) {
      const result = await updateTask(id, updates);
      return NextResponse.json({ data: result });
    }

    // Local filesystem mode
    const root = getProjectRoot();
    const index = rebuildIfCorrupt(root);
    const entry = findById(index.entries, id);

    if (!entry) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `태스크를 찾을 수 없습니다: ${id}` } },
        { status: 404 },
      );
    }

    const filePath = path.join(root, entry.file_path);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: { code: "FILE_NOT_FOUND", message: `파일을 찾을 수 없습니다` } },
        { status: 404 },
      );
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = parseMarkdown(raw);

    for (const [key, value] of Object.entries(updates)) {
      data[key] = value;
    }
    data.updated_at = new Date().toISOString().split("T")[0];

    fs.writeFileSync(filePath, stringifyMarkdown(data, content), "utf-8");

    const updated = incrementalUpdate(root);
    writeIndex(root, updated);

    return NextResponse.json({ data: { id, ...updates } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: { code: "INTERNAL", message } },
      { status: 500 },
    );
  }
}
