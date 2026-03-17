"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore, type TaskEntry } from "@/stores/useTaskStore";
import { useTeamStore, type TeamMember } from "@/stores/useTeamStore";
import { getInitials, getAvatarColor } from "@/lib/colors";
import { PixelOffice } from "@/components/pixel-office/PixelOffice";
import { AISuggestionList } from "@/components/AISuggestionList";
import { NaturalLanguageInput } from "@/components/NaturalLanguageInput";

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

  const mockSuggestions = [
    {
      taskId: "SIRA-003",
      currentStatus: "todo",
      suggestedStatus: "in_progress",
      reason: "관련 파일 src/api/auth.ts가 최근 수정되었고 PR #12가 열려 있습니다. 작업이 이미 시작된 것으로 보입니다.",
    },
    {
      taskId: "SIRA-007",
      currentStatus: "in_progress",
      suggestedStatus: "review",
      reason: "커밋 로그에 'feat: complete task SIRA-007' 메시지가 있고 관련 파일 변경이 완료된 것으로 보입니다.",
    },
    {
      taskId: "SIRA-010",
      currentStatus: "review",
      suggestedStatus: "done",
      reason: "PR #15가 머지되었고 관련 테스트가 모두 통과했습니다.",
    },
    {
      taskId: "SIRA-001",
      currentStatus: "backlog",
      suggestedStatus: "todo",
      reason: "스프린트 계획에 포함되어 있으며 담당자가 배정되었습니다.",
    },
  ];

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

      {/* AI 상태 제안 */}
      <div className="mb-8">
        <AISuggestionList suggestions={mockSuggestions} />
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

      {/* AI 태스크 생성 */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">AI 태스크 생성</h2>
        <NaturalLanguageInput />
      </section>
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
