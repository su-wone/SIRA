import type { IndexEntry } from "../types/index.types.js";

export interface StatusSuggestion {
  taskId: string;
  currentStatus: string;
  suggestedStatus: string;
  reason: string;
  evidence: { type: string; detail: string }[];
}

export interface GitActivity {
  taskId: string;
  relatedFiles: string[];
  recentCommits: { hash: string; message: string; date: string; files: string[] }[];
  openPRs: { number: number; title: string; state: string }[];
  mergedPRs: { number: number; title: string; mergedAt: string }[];
}

/**
 * Heuristic-based task status inference from git activity.
 * Runs locally without AI API calls for cost optimization.
 */
export function inferStatus(activity: GitActivity, currentStatus: string): StatusSuggestion | null {
  const { taskId, recentCommits, openPRs, mergedPRs, relatedFiles } = activity;

  // Rule 1: Merged PR → done
  if (mergedPRs.length > 0 && currentStatus !== "done") {
    return {
      taskId,
      currentStatus,
      suggestedStatus: "done",
      reason: "관련 PR이 머지되었습니다",
      evidence: mergedPRs.map((pr) => ({
        type: "merged_pr",
        detail: `PR #${pr.number}: ${pr.title} (${pr.mergedAt})`,
      })),
    };
  }

  // Rule 2: Open PR → review
  if (openPRs.length > 0 && currentStatus !== "review" && currentStatus !== "done") {
    return {
      taskId,
      currentStatus,
      suggestedStatus: "review",
      reason: "관련 PR이 생성되었습니다",
      evidence: openPRs.map((pr) => ({
        type: "open_pr",
        detail: `PR #${pr.number}: ${pr.title}`,
      })),
    };
  }

  // Rule 3: Recent commits on related files → in_progress
  if (recentCommits.length > 0 && (currentStatus === "todo" || currentStatus === "backlog")) {
    const relevantCommits = recentCommits.filter((c) =>
      c.files.some((f) => relatedFiles.some((rf) => f.includes(rf) || rf.includes(f))),
    );
    if (relevantCommits.length > 0) {
      return {
        taskId,
        currentStatus,
        suggestedStatus: "in_progress",
        reason: "관련 파일이 수정되었습니다",
        evidence: relevantCommits.slice(0, 3).map((c) => ({
          type: "commit",
          detail: `${c.hash.slice(0, 7)}: ${c.message} (${c.date})`,
        })),
      };
    }
  }

  return null;
}

/**
 * Batch inference for all tasks with related_files.
 */
export function inferAllStatuses(
  entries: IndexEntry[],
  activities: Map<string, GitActivity>,
): StatusSuggestion[] {
  const suggestions: StatusSuggestion[] = [];

  for (const entry of entries) {
    if (entry.status === "done" || entry.status === "cancelled") continue;
    if (entry.related_files.length === 0) continue;

    const activity = activities.get(entry.id);
    if (!activity) continue;

    const suggestion = inferStatus(activity, entry.status);
    if (suggestion) suggestions.push(suggestion);
  }

  return suggestions;
}
