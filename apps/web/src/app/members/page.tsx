"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { getInitials, getAvatarColor } from "@/lib/colors";

export default function MembersPage() {
  const { tasks, setTasks } = useTaskStore();
  const { members, setMembers } = useTeamStore();

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setTasks(res.data.tasks ?? []);
          setMembers(res.data.team ?? []);
        }
      });
  }, [setTasks, setMembers]);

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Members</h1>
      {members.length === 0 ? (
        <p className="text-muted-foreground">팀원이 등록되지 않았습니다.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const assigned = tasks.filter((t) => t.assignee === m.name);
            const statusCounts: Record<string, number> = {};
            for (const t of assigned) {
              statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
            }
            return (
              <Link
                key={m.name}
                href={`/members/${encodeURIComponent(m.name)}`}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(m.name)}`}>
                    {getInitials(m.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{m.name}</span>
                      {m.type === "ai" && (
                        <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-400">AI</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{m.role} · {m.type}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3 text-sm text-muted-foreground">
                  <span>{assigned.length}개 할당</span>
                  {statusCounts.in_progress && <span className="text-yellow-400">{statusCounts.in_progress} 진행중</span>}
                  {statusCounts.done && <span className="text-green-400">{statusCounts.done} 완료</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
