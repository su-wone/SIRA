import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { buildIndex, writeIndex } from "@sira/core";

const DEFAULT_CONFIG = {
  project: "",
  version: "1",
  team: [],
};

const DEFAULT_SCHEMA_YAML = `# .sira/schema.yaml — SIRA Frontmatter Schema Definition
task:
  required:
    - id
    - title
    - created_at
    - updated_at
  optional:
    - status          # enum: backlog, todo, in_progress, review, done, cancelled
    - assignee
    - priority        # enum: critical, high, medium, low
    - area            # enum: web, server, shared
    - epic_id
    - story_id
    - related_files   # string[]
    - tags            # string[]
    - start_date
    - due_date

epic:
  required:
    - id
    - title
    - created_at
    - updated_at
  optional:
    - status          # enum: backlog, in_progress, done, cancelled
    - owner
    - priority        # enum: critical, high, medium, low
    - start_date
    - due_date
`;

const TASK_DIRS = [
  "tasks/epics",
  "tasks/web",
  "tasks/server",
  "tasks/shared",
];

export function initProject(cwd: string, options: { force?: boolean } = {}): void {
  const siraDir = path.join(cwd, ".sira");
  const configPath = path.join(siraDir, "config.yaml");
  const schemaPath = path.join(siraDir, "schema.yaml");

  // Check if already initialized
  if (fs.existsSync(configPath) && !options.force) {
    console.log("이 프로젝트는 이미 SIRA로 초기화되어 있습니다.");
    console.log("덮어쓰려면 --force 옵션을 사용하세요: sira init --force");
    return;
  }

  // Create .sira/ directory
  if (!fs.existsSync(siraDir)) {
    fs.mkdirSync(siraDir, { recursive: true });
  }

  // Create config.yaml
  const projectName = path.basename(cwd);
  const config = { ...DEFAULT_CONFIG, project: projectName };
  fs.writeFileSync(configPath, yaml.dump(config), "utf-8");
  console.log("  생성: .sira/config.yaml");

  // Create schema.yaml
  fs.writeFileSync(schemaPath, DEFAULT_SCHEMA_YAML, "utf-8");
  console.log("  생성: .sira/schema.yaml");

  // Create task directories
  for (const dir of TASK_DIRS) {
    const fullPath = path.join(cwd, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      // Add .gitkeep to empty dirs
      fs.writeFileSync(path.join(fullPath, ".gitkeep"), "", "utf-8");
    }
    console.log(`  생성: ${dir}/`);
  }

  // Initialize empty index
  const index = buildIndex(cwd);
  writeIndex(cwd, index);
  console.log("  생성: .sira/index.json");

  // Update .gitignore
  const gitignorePath = path.join(cwd, ".gitignore");
  const ignoreEntry = ".sira/index.json";
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    if (!content.includes(ignoreEntry)) {
      fs.appendFileSync(gitignorePath, `\n${ignoreEntry}\n`, "utf-8");
      console.log("  수정: .gitignore (index.json 제외 추가)");
    }
  } else {
    fs.writeFileSync(gitignorePath, `${ignoreEntry}\n`, "utf-8");
    console.log("  생성: .gitignore");
  }

  console.log("\nSIRA 프로젝트 초기화 완료!");
  console.log("다음 단계: .sira/config.yaml에서 팀원을 등록하세요.");
}
