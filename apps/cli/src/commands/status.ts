import fs from "node:fs";
import path from "node:path";
import {
  readIndex,
  rebuildIfCorrupt,
  findById,
  readConfig,
  findMemberByName,
  assertCanChangeTaskStatus,
  parseMarkdown,
  stringifyMarkdown,
  TASK_STATUSES,
  incrementalUpdate,
  writeIndex,
} from "@sira/core";

export function statusCommand(taskId: string, newStatus: string, options: { user?: string }): void {
  const cwd = process.cwd();

  // Validate status
  if (!TASK_STATUSES.includes(newStatus as any)) {
    console.log(`유효하지 않은 상태: ${newStatus}`);
    console.log(`허용 상태: ${TASK_STATUSES.join(", ")}`);
    return;
  }

  // Find task in index
  const index = rebuildIfCorrupt(cwd);
  const entry = findById(index.entries, taskId);
  if (!entry) {
    console.log(`태스크를 찾을 수 없습니다: ${taskId}`);
    return;
  }

  // RBAC check
  if (options.user) {
    try {
      const config = readConfig(cwd);
      const member = findMemberByName(config, options.user);
      if (member) {
        assertCanChangeTaskStatus(member.role, member.name, entry.assignee);
      }
    } catch (e: any) {
      if (e.code === "PERMISSION_DENIED") {
        console.log(`권한 오류: ${e.message}`);
        return;
      }
      // Config not found — skip RBAC in dev
    }
  }

  // Update .md file
  const filePath = path.join(cwd, entry.file_path);
  if (!fs.existsSync(filePath)) {
    console.log(`파일을 찾을 수 없습니다: ${entry.file_path}`);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = parseMarkdown(raw);
  const oldStatus = data.status;
  data.status = newStatus;
  data.updated_at = new Date().toISOString().split("T")[0];

  fs.writeFileSync(filePath, stringifyMarkdown(data, content), "utf-8");

  // Update index
  const updatedIndex = incrementalUpdate(cwd);
  writeIndex(cwd, updatedIndex);

  console.log(`${taskId}: ${oldStatus} → ${newStatus}`);
}
