import fs from "node:fs";
import path from "node:path";
import {
  readIndex,
  rebuildIfCorrupt,
  parseFilterString,
  queryIndex,
  groupEntries,
  findById,
  findSimilarIds,
  parseMarkdown,
} from "@sira/core";

export function queryCommand(
  filterOrId: string,
  options: { sort?: string; group?: string; tree?: boolean },
): void {
  const cwd = process.cwd();
  const index = rebuildIfCorrupt(cwd);

  // Direct ID lookup (Story 3.3)
  if (/^[A-Z]+-\d+$/i.test(filterOrId)) {
    showTaskDetail(cwd, filterOrId, index.entries);
    return;
  }

  // Filter-based query
  const filters = parseFilterString(filterOrId);
  const results = queryIndex(index.entries, {
    filters,
    sort: options.sort,
  });

  if (results.length === 0) {
    console.log("조건에 맞는 태스크가 없습니다.");
    return;
  }

  if (options.group) {
    const groups = groupEntries(results, options.group);
    for (const [key, entries] of groups) {
      console.log(`\n[${key}] (${entries.length})`);
      printTable(entries);
    }
  } else {
    console.log(`\n총 ${results.length}개 태스크\n`);
    printTable(results);
  }
}

function printTable(entries: { id: string; title: string; status: string; assignee?: string; priority: string }[]): void {
  const header = `${"ID".padEnd(12)} ${"제목".padEnd(24)} ${"상태".padEnd(14)} ${"담당자".padEnd(10)} ${"우선순위"}`;
  console.log(header);
  console.log("─".repeat(74));
  for (const e of entries) {
    const row = `${e.id.padEnd(12)} ${e.title.slice(0, 20).padEnd(24)} ${e.status.padEnd(14)} ${(e.assignee ?? "-").padEnd(10)} ${e.priority}`;
    console.log(row);
  }
}

function showTaskDetail(
  cwd: string,
  id: string,
  entries: { id: string; file_path: string; title: string; status: string; assignee?: string; priority: string; epic_id?: string; related_files: string[]; tags: string[]; created_at: string; updated_at: string }[],
): void {
  const entry = findById(entries, id);
  if (!entry) {
    console.log(`태스크를 찾을 수 없습니다: ${id}`);
    const similar = findSimilarIds(entries, id);
    if (similar.length > 0) {
      console.log(`혹시 ${similar.join(", ")}를 찾으셨나요?`);
    }
    return;
  }

  // Read full .md content
  const filePath = path.join(cwd, entry.file_path);
  let body = "";
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = parseMarkdown(raw);
    body = parsed.content.trim();
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  ${entry.id}: ${entry.title}`);
  console.log(`${"═".repeat(50)}`);
  console.log(`  상태:     ${entry.status}`);
  console.log(`  우선순위: ${entry.priority}`);
  console.log(`  담당자:   ${entry.assignee ?? "-"}`);
  if (entry.epic_id) console.log(`  에픽:     ${entry.epic_id}`);
  if (entry.tags.length) console.log(`  태그:     ${entry.tags.join(", ")}`);
  console.log(`  생성일:   ${entry.created_at}`);
  console.log(`  수정일:   ${entry.updated_at}`);
  if (entry.related_files.length) {
    console.log(`  관련파일:`);
    for (const f of entry.related_files) {
      console.log(`    - ${f}`);
    }
  }
  if (body) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(body);
  }
  console.log();
}
