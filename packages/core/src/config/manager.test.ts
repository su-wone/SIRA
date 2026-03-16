import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";
import {
  readConfig,
  writeConfig,
  addTeamMember,
  removeTeamMember,
  findMemberByGithub,
  findMemberByName,
} from "./manager.js";
import { SchemaValidationError } from "../errors/index.js";

let tempDir: string;

function initProject(config?: Record<string, unknown>): void {
  const siraDir = path.join(tempDir, ".sira");
  fs.mkdirSync(siraDir, { recursive: true });
  const defaultConfig = config ?? { project: "test-project", version: "1", team: [] };
  fs.writeFileSync(path.join(siraDir, "config.yaml"), yaml.dump(defaultConfig), "utf-8");
}

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sira-config-"));
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("readConfig", () => {
  it("reads a valid config", () => {
    initProject({
      project: "my-project",
      version: "1",
      team: [{ name: "수원", role: "admin", type: "human", github_username: "suwon" }],
    });
    const config = readConfig(tempDir);
    expect(config.project).toBe("my-project");
    expect(config.team).toHaveLength(1);
    expect(config.team[0].name).toBe("수원");
  });

  it("throws when config.yaml does not exist", () => {
    expect(() => readConfig(tempDir)).toThrow(SchemaValidationError);
  });

  it("throws on invalid config", () => {
    initProject({ project: 123, team: "invalid" });
    expect(() => readConfig(tempDir)).toThrow(SchemaValidationError);
  });
});

describe("writeConfig", () => {
  it("writes config to file", () => {
    initProject();
    const config = { project: "updated", version: "1", team: [] };
    writeConfig(tempDir, config);
    const result = readConfig(tempDir);
    expect(result.project).toBe("updated");
  });
});

describe("addTeamMember", () => {
  it("adds a human member", () => {
    initProject();
    const config = addTeamMember(tempDir, {
      name: "지영",
      role: "member",
      type: "human",
      github_username: "jiyoung",
    });
    expect(config.team).toHaveLength(1);
    expect(config.team[0].name).toBe("지영");
  });

  it("adds an AI agent member", () => {
    initProject();
    const config = addTeamMember(tempDir, {
      name: "Claude",
      role: "agent",
      type: "ai",
    });
    expect(config.team).toHaveLength(1);
    expect(config.team[0].type).toBe("ai");
    expect(config.team[0].role).toBe("agent");
  });

  it("rejects duplicate member", () => {
    initProject();
    addTeamMember(tempDir, { name: "지영", role: "member", type: "human" });
    expect(() =>
      addTeamMember(tempDir, { name: "지영", role: "admin", type: "human" }),
    ).toThrow("이미 등록된 팀 멤버");
  });

  it("rejects invalid member data", () => {
    initProject();
    expect(() =>
      addTeamMember(tempDir, { name: "test", role: "superadmin" as any, type: "human" }),
    ).toThrow(SchemaValidationError);
  });
});

describe("removeTeamMember", () => {
  it("removes an existing member", () => {
    initProject();
    addTeamMember(tempDir, { name: "지영", role: "member", type: "human" });
    const config = removeTeamMember(tempDir, "지영");
    expect(config.team).toHaveLength(0);
  });

  it("throws when member not found", () => {
    initProject();
    expect(() => removeTeamMember(tempDir, "없는사람")).toThrow("팀 멤버를 찾을 수 없습니다");
  });
});

describe("findMember helpers", () => {
  it("finds member by github username", () => {
    const config = {
      project: "test",
      version: "1",
      team: [
        { name: "수원", role: "admin" as const, type: "human" as const, github_username: "suwon" },
        { name: "Claude", role: "agent" as const, type: "ai" as const },
      ],
    };
    expect(findMemberByGithub(config, "suwon")?.name).toBe("수원");
    expect(findMemberByGithub(config, "unknown")).toBeUndefined();
  });

  it("finds member by name", () => {
    const config = {
      project: "test",
      version: "1",
      team: [{ name: "Claude", role: "agent" as const, type: "ai" as const }],
    };
    expect(findMemberByName(config, "Claude")?.role).toBe("agent");
    expect(findMemberByName(config, "없음")).toBeUndefined();
  });
});
