"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { STATUS_COLORS, PRIORITY_COLORS, getInitials, getAvatarColor } from "@/lib/colors";
import type { TaskEntry } from "@/stores/useTaskStore";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [task, setTask] = useState<TaskEntry | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          const found = (res.data.tasks as TaskEntry[]).find((t) => t.id === id);
          if (found) setTask(found);
        }
      });
    fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.content) setContent(res.data.content);
      })
      .catch(() => {});
  }, [id]);

  if (!task) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">태스크를 찾을 수 없습니다: {id}</p>
      </DashboardLayout>
    );
  }

  const sc = STATUS_COLORS[task.status] ?? STATUS_COLORS.backlog;
  const pc = PRIORITY_COLORS[task.priority] ?? "";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold">{task.title}</h1>
        <p className="mb-6 font-mono text-sm text-muted-foreground">{task.id}</p>

        {/* 메타데이터 뱃지 */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
            {task.status}
          </span>
          <span className={`rounded-full bg-muted px-3 py-1 text-xs font-medium ${pc}`}>
            {task.priority}
          </span>
          {task.assignee && (
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${getAvatarColor(task.assignee)}`}>
                {getInitials(task.assignee)}
              </span>
              {task.assignee}
            </span>
          )}
          {task.area && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs">{task.area}</span>
          )}
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
              {tag}
            </span>
          ))}
        </div>

        {/* 정보 */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-border p-4 text-sm">
          {task.epic_id && <div><span className="text-muted-foreground">에픽:</span> {task.epic_id}</div>}
          <div><span className="text-muted-foreground">생성일:</span> {task.created_at}</div>
          <div><span className="text-muted-foreground">수정일:</span> {task.updated_at}</div>
          {task.start_date && <div><span className="text-muted-foreground">시작일:</span> {task.start_date}</div>}
          {task.due_date && <div><span className="text-muted-foreground">마감일:</span> {task.due_date}</div>}
        </div>

        {/* 관련 파일 */}
        {task.related_files.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium">관련 파일</h3>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {task.related_files.map((f) => (
                <li key={f} className="font-mono">{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 마크다운 본문 */}
        {content && (
          <div className="prose prose-invert max-w-none rounded-lg border border-border p-6">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
