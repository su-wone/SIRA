import fs from "node:fs";
import path from "node:path";
import {
  rebuildIfCorrupt,
  readConfig,
  findById,
  findMemberByName,
  assertPermission,
  parseMarkdown,
  stringifyMarkdown,
  incrementalUpdate,
  writeIndex,
} from "@sira/core";

export function assignCommand(
  taskId: string,
  assigneeName: string,
  options: { user?: string },
): void {
  const cwd = process.cwd();

  // RBAC check — only admin can assign
  if (options.user) {
    try {
      const config = readConfig(cwd);
      const member = findMemberByName(config, options.user);
      if (member) {
        assertPermission(member.role, "task:assign");
      }
    } catch (e: any) {
      if (e.code === "PERMISSION_DENIED") {
        console.log(`권한 오류: ${e.message}`);
        return;
      }
    }
  }

  // Validate assignee exists in config
  try {
    const config = readConfig(cwd);
    const assignee = findMemberByName(config, assigneeName);
    if (!assignee) {
      console.log(`팀 멤버를 찾을 수 없습니다: ${assigneeName}`);
      console.log(`등록된 팀원: ${config.team.map((m) => m.name).join(", ") || "(없음)"}`);
      return;
    }
  } catch {
    // Config not available — skip validation
  }

  // Find task
  const index = rebuildIfCorrupt(cwd);
  const entry = findById(index.entries, taskId);
  if (!entry) {
    console.log(`태스크를 찾을 수 없습니다: ${taskId}`);
    return;
  }

  // Update .md file
  const filePath = path.join(cwd, entry.file_path);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = parseMarkdown(raw);
  const oldAssignee = data.assignee ?? "-";
  data.assignee = assigneeName;
  data.updated_at = new Date().toISOString().split("T")[0];

  fs.writeFileSync(filePath, stringifyMarkdown(data, content), "utf-8");

  // Update index
  const updatedIndex = incrementalUpdate(cwd);
  writeIndex(cwd, updatedIndex);

  console.log(`${taskId}: ${oldAssignee} → ${assigneeName}`);
}
