"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore } from "@/stores/useTaskStore";
import { STATUS_COLORS, PRIORITY_COLORS, getInitials, getAvatarColor } from "@/lib/colors";

export default function TasksPage() {
  const { tasks, setTasks } = useTaskStore();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [sortField, setSortField] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setTasks(res.data.tasks ?? []);
      });
  }, [setTasks]);

  let filtered = tasks;
  if (filterStatus) filtered = filtered.filter((t) => t.status === filterStatus);
  if (filterAssignee) filtered = filtered.filter((t) => t.assignee === filterAssignee);

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortField] as string ?? "";
    const bVal = (b as unknown as Record<string, unknown>)[sortField] as string ?? "";
    return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const assignees = [...new Set(tasks.map((t) => t.assignee).filter(Boolean))];
  const statuses = [...new Set(tasks.map((t) => t.status))];

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>

      {/* 필터 */}
      <div className="mb-4 flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="">전체 상태</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="">전체 담당자</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-muted-foreground">{sorted.length}개 태스크</span>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="cursor-pointer px-4 py-3 text-left font-medium" onClick={() => toggleSort("id")}>ID</th>
              <th className="cursor-pointer px-4 py-3 text-left font-medium" onClick={() => toggleSort("title")}>제목</th>
              <th className="cursor-pointer px-4 py-3 text-left font-medium" onClick={() => toggleSort("status")}>상태</th>
              <th className="cursor-pointer px-4 py-3 text-left font-medium" onClick={() => toggleSort("assignee")}>담당자</th>
              <th className="cursor-pointer px-4 py-3 text-left font-medium" onClick={() => toggleSort("priority")}>우선순위</th>
              <th className="cursor-pointer px-4 py-3 text-left font-medium" onClick={() => toggleSort("updated_at")}>수정일</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS.backlog;
              const pc = PRIORITY_COLORS[t.priority] ?? "";
              return (
                <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/tasks/${t.id}`} className="hover:underline">{t.title}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${getAvatarColor(t.assignee)}`}>
                          {getInitials(t.assignee)}
                        </div>
                        <span>{t.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-xs font-medium ${pc}`}>{t.priority}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.updated_at}</td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  태스크가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
