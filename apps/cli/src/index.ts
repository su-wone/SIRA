import { Command } from "commander";
import { SIRA_VERSION } from "@sira/core";
import { initProject } from "./commands/init.js";
import { queryCommand } from "./commands/query.js";
import { statusCommand } from "./commands/status.js";
import { decomposeCommand } from "./commands/decompose.js";
import { assignCommand } from "./commands/assign.js";
import { askCommand } from "./commands/ask.js";

const program = new Command();

program
  .name("sira")
  .description("SIRA — AI-native project management CLI")
  .version(SIRA_VERSION);

program
  .command("init")
  .description("프로젝트를 SIRA로 초기화합니다")
  .option("--force", "기존 설정을 덮어씁니다")
  .action((options) => {
    initProject(process.cwd(), { force: options.force });
  });

program
  .command("query [filter]")
  .description("태스크를 조회합니다 (예: sira query \"status:todo assignee:지영\")")
  .option("--sort <field>", "정렬 기준 (priority, created_at 등)")
  .option("--group <field>", "그룹핑 기준 (status, epic_id 등)")
  .option("--tree", "에픽/스토리/태스크 계층 구조로 표시")
  .action((filter, options) => {
    queryCommand(filter ?? "", options);
  });

program
  .command("status <taskId> <newStatus>")
  .description("태스크 상태를 변경합니다 (예: sira status TASK-001 in_progress)")
  .option("--user <name>", "현재 사용자 이름 (RBAC 검증)")
  .action((taskId, newStatus, options) => {
    statusCommand(taskId, newStatus, options);
  });

program
  .command("decompose <input>")
  .description("자연어 백로그를 태스크로 분해합니다")
  .option("--dry-run", "실제 파일을 생성하지 않고 미리보기")
  .action((input, options) => {
    decomposeCommand(input, options);
  });

program
  .command("assign <taskId> <assignee>")
  .description("태스크를 팀원에게 할당합니다")
  .option("--user <name>", "현재 사용자 이름 (RBAC 검증)")
  .action((taskId, assignee, options) => {
    assignCommand(taskId, assignee, options);
  });

program
  .command("ask <question>")
  .description("AI에게 프로젝트 상태를 질의합니다")
  .action((question) => {
    askCommand(question);
  });

program.parse();
