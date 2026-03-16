import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { siraConfigSchema, teamMemberSchema } from "../schema/config.schema.js";
import { SchemaValidationError } from "../errors/index.js";
import type { SiraConfig, TeamMember } from "../schema/config.schema.js";

const CONFIG_PATH = ".sira/config.yaml";

export function readConfig(projectRoot: string): SiraConfig {
  const configPath = path.join(projectRoot, CONFIG_PATH);
  if (!fs.existsSync(configPath)) {
    throw new SchemaValidationError(
      `.sira/config.yaml이 존재하지 않습니다. 'sira init'을 먼저 실행하세요.`,
    );
  }

  const raw = fs.readFileSync(configPath, "utf-8");
  const data = yaml.load(raw);
  const result = siraConfigSchema.safeParse(data);
  if (!result.success) {
    throw new SchemaValidationError(
      `config.yaml 스키마 검증 실패: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function writeConfig(projectRoot: string, config: SiraConfig): void {
  const configPath = path.join(projectRoot, CONFIG_PATH);
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, yaml.dump(config), "utf-8");
}

export function addTeamMember(projectRoot: string, member: TeamMember): SiraConfig {
  const result = teamMemberSchema.safeParse(member);
  if (!result.success) {
    throw new SchemaValidationError(
      `팀 멤버 스키마 검증 실패: ${result.error.message}`,
      result.error.issues,
    );
  }

  const config = readConfig(projectRoot);
  const existing = config.team.find(
    (m) => m.name === member.name || (m.github_username && m.github_username === member.github_username),
  );
  if (existing) {
    throw new SchemaValidationError(
      `이미 등록된 팀 멤버입니다: ${member.name}`,
    );
  }

  config.team.push(result.data);
  writeConfig(projectRoot, config);
  return config;
}

export function removeTeamMember(projectRoot: string, name: string): SiraConfig {
  const config = readConfig(projectRoot);
  const idx = config.team.findIndex((m) => m.name === name);
  if (idx === -1) {
    throw new SchemaValidationError(`팀 멤버를 찾을 수 없습니다: ${name}`);
  }
  config.team.splice(idx, 1);
  writeConfig(projectRoot, config);
  return config;
}

export function findMemberByGithub(config: SiraConfig, githubUsername: string): TeamMember | undefined {
  return config.team.find((m) => m.github_username === githubUsername);
}

export function findMemberByName(config: SiraConfig, name: string): TeamMember | undefined {
  return config.team.find((m) => m.name === name);
}
