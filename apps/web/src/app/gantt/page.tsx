"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore } from "@/stores/useTaskStore";
import { STATUS_COLORS } from "@/lib/colors";

export default function GanttPage() {
  const { tasks, setTasks } = useTaskStore();

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setTasks(res.data.tasks ?? []);
      });
  }, [setTasks]);

  // Group by epic
  const epics = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const key = t.epic_id ?? "미지정";
    (epics.get(key) ?? (() => { const a: typeof tasks = []; epics.set(key, a); return a; })()).push(t);
  }

  // Date range
  const allDates = tasks
    .flatMap((t) => [t.start_date, t.due_date, t.created_at])
    .filter(Boolean) as string[];
  const minDate = allDates.length ? new Date(allDates.sort()[0]) : new Date();
  const maxDate = allDates.length ? new Date(allDates.sort().reverse()[0]) : new Date();
  const totalDays = Math.max(Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000), 30);

  function dayOffset(dateStr?: string): number {
    if (!dateStr) return 0;
    return Math.max(0, Math.ceil((new Date(dateStr).getTime() - minDate.getTime()) / 86400000));
  }

  function dayWidth(start?: string, end?: string): number {
    const s = start ? dayOffset(start) : 0;
    const e = end ? dayOffset(end) : s + 7;
    return Math.max(e - s, 3);
  }

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Gantt</h1>
      <div className="overflow-x-auto">
        {[...epics.entries()].map(([epicId, epicTasks]) => (
          <div key={epicId} className="mb-6">
            <h3 className="mb-2 text-sm font-semibold">{epicId}</h3>
            <div className="flex flex-col gap-1">
              {epicTasks.map((t) => {
                const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS.backlog;
                const left = (dayOffset(t.start_date || t.created_at) / totalDays) * 100;
                const width = (dayWidth(t.start_date || t.created_at, t.due_date) / totalDays) * 100;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="w-40 flex-shrink-0 truncate text-sm hover:underline"
                    >
                      {t.title}
                    </Link>
                    <div className="relative h-6 flex-1 rounded bg-muted/30">
                      <div
                        className={`absolute h-full rounded ${sc.dot} opacity-80`}
                        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        title={`${t.start_date ?? t.created_at} ~ ${t.due_date ?? "미정"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-muted-foreground">태스크가 없습니다.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
