import fs from "node:fs";
import path from "node:path";
import {
  rebuildIfCorrupt,
  writeIndex,
  incrementalUpdate,
  stringifyMarkdown,
} from "@sira/core";

export function decomposeCommand(input: string, options: { dryRun?: boolean }): void {
  const cwd = process.cwd();

  // Verify project initialized
  if (!fs.existsSync(path.join(cwd, ".sira", "config.yaml"))) {
    console.log("SIRA 프로젝트가 초기화되지 않았습니다. 'sira init'을 먼저 실행하세요.");
    return;
  }

  // Read existing index for context
  const index = rebuildIfCorrupt(cwd);
  const existingIds = index.entries.map((e) => e.id);
  const nextNum = existingIds.length > 0
    ? Math.max(...existingIds.map((id) => {
        const m = id.match(/\d+$/);
        return m ? parseInt(m[0], 10) : 0;
      })) + 1
    : 1;

  console.log(`\n자연어 입력: "${input}"`);
  console.log(`\n이 기능은 로컬 Claude Code와 연동하여 동작합니다.`);
  console.log(`Claude Code에서 다음과 같이 실행하세요:\n`);
  console.log(`  1. 이 프로젝트에서 Claude Code를 실행합니다`);
  console.log(`  2. 다음 프롬프트를 입력합니다:\n`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  SIRA 프로토콜(.sira/AGENTS.md)을 읽고,`);
  console.log(`  다음 백로그를 에픽/스토리/태스크로 분해하여`);
  console.log(`  tasks/ 디렉토리에 .md 파일을 생성해주세요.`);
  console.log(`  `);
  console.log(`  백로그: ${input}`);
  console.log(`  `);
  console.log(`  다음 ID 번호부터 시작: ${String(nextNum).padStart(3, "0")}`);
  console.log(`  ─────────────────────────────────────────\n`);

  // Copy AGENTS.md to project if not exists
  const agentsPath = path.join(cwd, ".sira", "AGENTS.md");
  if (!fs.existsSync(agentsPath)) {
    const templatePath = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      "..",
      "..",
      "node_modules",
      "@sira",
      "core",
      "templates",
      "AGENTS.md",
    );
    // Try to find the template
    const corePkgPath = path.resolve(cwd, "packages", "core", "templates", "AGENTS.md");
    if (fs.existsSync(corePkgPath)) {
      fs.copyFileSync(corePkgPath, agentsPath);
      console.log("  .sira/AGENTS.md 프로토콜 파일을 생성했습니다.");
    }
  }
}
