import { NextResponse } from "next/server";
import { rebuildIfCorrupt, findById, parseMarkdown } from "@sira/core";
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
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: e.message } },
      { status: 500 },
    );
  }
}
