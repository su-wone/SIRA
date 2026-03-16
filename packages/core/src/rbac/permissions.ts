import type { MemberRole } from "../schema/config.schema.js";
import { SiraError } from "../errors/SiraError.js";

export type Action =
  | "task:create"
  | "task:assign"
  | "task:status_change"
  | "task:approve"
  | "task:delete"
  | "config:manage"
  | "member:manage";

const ROLE_PERMISSIONS: Record<MemberRole, Set<Action>> = {
  admin: new Set([
    "task:create",
    "task:assign",
    "task:status_change",
    "task:approve",
    "task:delete",
    "config:manage",
    "member:manage",
  ]),
  member: new Set([
    "task:status_change",
  ]),
  agent: new Set([
    "task:status_change",
  ]),
};

export class PermissionDeniedError extends SiraError {
  constructor(role: MemberRole, action: Action) {
    super("PERMISSION_DENIED", `'${role}' 역할은 '${action}' 작업을 수행할 수 없습니다.`);
    this.name = "PermissionDeniedError";
  }
}

export function hasPermission(role: MemberRole, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function assertPermission(role: MemberRole, action: Action): void {
  if (!hasPermission(role, action)) {
    throw new PermissionDeniedError(role, action);
  }
}

/**
 * Check if a member can change the status of a given task.
 * - admin: can change any task
 * - member/agent: can only change their own assigned tasks
 */
export function canChangeTaskStatus(
  role: MemberRole,
  memberName: string,
  taskAssignee: string | undefined,
): boolean {
  if (role === "admin") return true;
  if (!taskAssignee) return false;
  return memberName === taskAssignee;
}

export function assertCanChangeTaskStatus(
  role: MemberRole,
  memberName: string,
  taskAssignee: string | undefined,
): void {
  if (!canChangeTaskStatus(role, memberName, taskAssignee)) {
    throw new PermissionDeniedError(
      role,
      "task:status_change",
    );
  }
}
