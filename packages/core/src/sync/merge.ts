import { SyncConflictError } from "../errors/index.js";

export interface MergeResult {
  merged: Record<string, unknown>;
  conflicts: string[];
}

/**
 * Field-level merge: merges two versions of frontmatter data against a common base.
 * - If only one side changed a field, take that change.
 * - If both sides changed the same field to different values, it's a conflict.
 */
export function fieldLevelMerge(
  base: Record<string, unknown>,
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): MergeResult {
  const allKeys = new Set([
    ...Object.keys(base),
    ...Object.keys(local),
    ...Object.keys(remote),
  ]);

  const merged: Record<string, unknown> = {};
  const conflicts: string[] = [];

  for (const key of allKeys) {
    const baseVal = JSON.stringify(base[key]);
    const localVal = JSON.stringify(local[key]);
    const remoteVal = JSON.stringify(remote[key]);

    if (localVal === remoteVal) {
      // Both agree (or neither changed)
      merged[key] = local[key];
    } else if (localVal === baseVal) {
      // Only remote changed
      merged[key] = remote[key];
    } else if (remoteVal === baseVal) {
      // Only local changed
      merged[key] = local[key];
    } else {
      // Both changed to different values — conflict
      conflicts.push(key);
      merged[key] = local[key]; // default to local
    }
  }

  return { merged, conflicts };
}

/**
 * Attempt merge; throw SyncConflictError if there are conflicts.
 */
export function mergeOrThrow(
  base: Record<string, unknown>,
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): Record<string, unknown> {
  const { merged, conflicts } = fieldLevelMerge(base, local, remote);
  if (conflicts.length > 0) {
    throw new SyncConflictError(
      `필드 충돌 발생: ${conflicts.join(", ")}`,
      local,
      remote,
    );
  }
  return merged;
}
