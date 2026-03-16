import { describe, it, expect } from "vitest";
import {
  hasPermission,
  assertPermission,
  canChangeTaskStatus,
  assertCanChangeTaskStatus,
  PermissionDeniedError,
} from "./permissions.js";

describe("hasPermission", () => {
  it("admin has all permissions", () => {
    expect(hasPermission("admin", "task:create")).toBe(true);
    expect(hasPermission("admin", "task:assign")).toBe(true);
    expect(hasPermission("admin", "task:status_change")).toBe(true);
    expect(hasPermission("admin", "task:approve")).toBe(true);
    expect(hasPermission("admin", "task:delete")).toBe(true);
    expect(hasPermission("admin", "config:manage")).toBe(true);
    expect(hasPermission("admin", "member:manage")).toBe(true);
  });

  it("member can only change task status", () => {
    expect(hasPermission("member", "task:status_change")).toBe(true);
    expect(hasPermission("member", "task:create")).toBe(false);
    expect(hasPermission("member", "task:assign")).toBe(false);
    expect(hasPermission("member", "task:approve")).toBe(false);
    expect(hasPermission("member", "config:manage")).toBe(false);
  });

  it("agent can only change task status", () => {
    expect(hasPermission("agent", "task:status_change")).toBe(true);
    expect(hasPermission("agent", "task:create")).toBe(false);
    expect(hasPermission("agent", "task:assign")).toBe(false);
    expect(hasPermission("agent", "config:manage")).toBe(false);
  });
});

describe("assertPermission", () => {
  it("does not throw for allowed action", () => {
    expect(() => assertPermission("admin", "task:create")).not.toThrow();
  });

  it("throws PermissionDeniedError for denied action", () => {
    expect(() => assertPermission("member", "task:create")).toThrow(PermissionDeniedError);
  });

  it("error has correct code and message", () => {
    try {
      assertPermission("agent", "config:manage");
      expect.fail("should have thrown");
    } catch (e) {
      const err = e as PermissionDeniedError;
      expect(err.code).toBe("PERMISSION_DENIED");
      expect(err.message).toContain("agent");
      expect(err.message).toContain("config:manage");
    }
  });
});

describe("canChangeTaskStatus", () => {
  it("admin can change any task", () => {
    expect(canChangeTaskStatus("admin", "수원", "지영")).toBe(true);
    expect(canChangeTaskStatus("admin", "수원", undefined)).toBe(true);
  });

  it("member can change own task", () => {
    expect(canChangeTaskStatus("member", "지영", "지영")).toBe(true);
  });

  it("member cannot change other's task", () => {
    expect(canChangeTaskStatus("member", "지영", "수원")).toBe(false);
  });

  it("member cannot change unassigned task", () => {
    expect(canChangeTaskStatus("member", "지영", undefined)).toBe(false);
  });

  it("agent can change own assigned task", () => {
    expect(canChangeTaskStatus("agent", "Claude", "Claude")).toBe(true);
  });

  it("agent cannot change other's task", () => {
    expect(canChangeTaskStatus("agent", "Claude", "지영")).toBe(false);
  });
});

describe("assertCanChangeTaskStatus", () => {
  it("throws for unauthorized status change", () => {
    expect(() =>
      assertCanChangeTaskStatus("member", "지영", "수원"),
    ).toThrow(PermissionDeniedError);
  });

  it("does not throw for authorized status change", () => {
    expect(() =>
      assertCanChangeTaskStatus("member", "지영", "지영"),
    ).not.toThrow();
  });
});
