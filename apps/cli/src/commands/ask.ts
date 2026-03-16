import {
  rebuildIfCorrupt,
  readConfig,
} from "@sira/core";

export function askCommand(question: string): void {
  const cwd = process.cwd();

  // Gather project context
  const index = rebuildIfCorrupt(cwd);
  const entries = index.entries;

  let teamInfo = "";
  try {
    const config = readConfig(cwd);
    teamInfo = config.team.map((m) => `${m.name}(${m.role}/${m.type})`).join(", ");
  } catch {
    teamInfo = "(설정 없음)";
  }

  const statusCounts: Record<string, number> = {};
  for (const e of entries) {
    statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;
  }

  const assigneeCounts: Record<string, number> = {};
  for (const e of entries) {
    if (e.assignee) {
      assigneeCounts[e.assignee] = (assigneeCounts[e.assignee] ?? 0) + 1;
    }
  }

  console.log(`\n질문: "${question}"\n`);
  console.log(`이 기능은 로컬 Claude Code와 연동하여 동작합니다.`);
  console.log(`Claude Code에서 다음 컨텍스트와 함께 질문하세요:\n`);
  console.log(`─────────────────────────────────────────`);
  console.log(`[SIRA 프로젝트 컨텍스트]`);
  console.log(`총 태스크: ${entries.length}개`);
  console.log(`상태별: ${Object.entries(statusCounts).map(([k, v]) => `${k}(${v})`).join(", ")}`);
  console.log(`담당자별: ${Object.entries(assigneeCounts).map(([k, v]) => `${k}(${v})`).join(", ") || "(할당 없음)"}`);
  console.log(`팀: ${teamInfo}`);
  console.log(`\n[질문] ${question}`);
  console.log(`─────────────────────────────────────────\n`);
}
