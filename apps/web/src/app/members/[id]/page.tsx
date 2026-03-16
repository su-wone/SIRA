"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { STATUS_COLORS, getInitials, getAvatarColor } from "@/lib/colors";

export default function MemberDetailPage() {
  const params = useParams();
  const name = decodeURIComponent(params?.id as string);
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

  const member = members.find((m) => m.name === name);
  const assigned = tasks.filter((t) => t.assignee === name);

  const grouped: Record<string, typeof assigned> = {};
  for (const t of assigned) {
    (grouped[t.status] ??= []).push(t);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${getAvatarColor(name)}`}>
            {getInitials(name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              {member?.type === "ai" && (
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-sm text-purple-400">AI</span>
              )}
            </div>
            {member && <p className="text-muted-foreground">{member.role} · {member.type}</p>}
          </div>
        </div>

        {Object.entries(grouped).map(([status, groupTasks]) => {
          const sc = STATUS_COLORS[status] ?? STATUS_COLORS.backlog;
          return (
            <div key={status} className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                {status} ({groupTasks.length})
              </h2>
              <div className="flex flex-col gap-2">
                {groupTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-accent"
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                      <span className="ml-2">{t.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.updated_at}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {assigned.length === 0 && (
          <p className="text-muted-foreground">할당된 태스크가 없습니다.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
