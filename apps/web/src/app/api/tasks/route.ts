import { NextResponse } from "next/server";
import { isGitHubMode, fetchAllTasks, fetchTeam } from "@/lib/github";
import { rebuildIfCorrupt, readConfig } from "@sira/core";

function getProjectRoot(): string {
  return process.env.SIRA_PROJECT_ROOT ?? process.cwd();
}

export async function GET() {
  try {
    if (isGitHubMode()) {
      const [tasks, team] = await Promise.all([fetchAllTasks(), fetchTeam()]);
      return NextResponse.json({ data: { tasks, team } });
    }

    // Local filesystem mode
    const root = getProjectRoot();
    const index = rebuildIfCorrupt(root);

    let team: { name: string; role: string; type: string; github_username?: string }[] = [];
    try {
      const config = readConfig(root);
      team = config.team;
    } catch {
      // config not found
    }

    return NextResponse.json({ data: { tasks: index.entries, team } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: { code: "INTERNAL", message } },
      { status: 500 },
    );
  }
}
