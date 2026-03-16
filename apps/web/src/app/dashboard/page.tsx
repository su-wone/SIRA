"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore, type TaskEntry } from "@/stores/useTaskStore";
import { useTeamStore, type TeamMember } from "@/stores/useTeamStore";
import { STATUS_COLORS, getInitials, getAvatarColor } from "@/lib/colors";
import { PixelOffice } from "@/components/pixel-office/PixelOffice";

export default function DashboardPage() {
  const { tasks, setTasks, isLoading, setLoading } = useTaskStore();
  const { members, setMembers } = useTeamStore();

  useEffect(() => {
    setLoading(true);
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setTasks(res.data.tasks ?? []);
          setMembers(res.data.team ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [setTasks, setMembers, setLoading]);

  const stats = {
    total: tasks.length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    review: tasks.filter((t) => t.status === "review").length,
    backlog: tasks.filter((t) => t.status === "backlog").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* 글로벌 통계 바 (UX6) */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="전체" value={stats.total} color="text-foreground" />
        <StatCard label="진행중" value={stats.in_progress} color="text-yellow-400" />
        <StatCard label="리뷰" value={stats.review} color="text-purple-400" />
        <StatCard label="완료" value={stats.done} color="text-green-400" />
        <StatCard label="할 일" value={stats.todo} color="text-blue-400" />
        <StatCard label="백로그" value={stats.backlog} color="text-gray-400" />
      </div>

      {/* 픽셀 오피스 (UX8) */}
      <PixelOffice members={members} tasks={tasks} />

      {/* 팀 현황 */}
      <h2 className="mb-4 text-lg font-semibold">팀 현황</h2>
      {members.length === 0 && !isLoading ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          팀원이 등록되지 않았습니다. .sira/config.yaml에서 팀원을 추가하세요.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <MemberCard key={m.name} member={m} tasks={tasks} />
          ))}
        </div>
      )}

      {tasks.length === 0 && !isLoading && (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">첫 백로그를 만들어 보세요</p>
          <p className="mt-2 text-sm">
            tasks/ 디렉토리에 .md 파일을 생성하거나, sira decompose 명령을 사용하세요.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function MemberCard({ member, tasks }: { member: TeamMember; tasks: TaskEntry[] }) {
  const assigned = tasks.filter((t) => t.assignee === member.name);
  const inProgress = assigned.filter((t) => t.status === "in_progress").length;
  const done = assigned.filter((t) => t.status === "done").length;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(member.name)}`}
      >
        {getInitials(member.name)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{member.name}</span>
          {member.type === "ai" && (
            <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-400">AI</span>
          )}
          <span className="text-xs text-muted-foreground">{member.role}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {assigned.length}개 할당 · {inProgress} 진행중 · {done} 완료
        </p>
      </div>
    </div>
  );
}
