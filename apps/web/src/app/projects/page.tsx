"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore } from "@/stores/useTaskStore";
import { STATUS_COLORS } from "@/lib/colors";

export default function ProjectsPage() {
  const { tasks, setTasks } = useTaskStore();

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setTasks(res.data.tasks ?? []);
      });
  }, [setTasks]);

  // Group by epic_id
  const epics = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const key = t.epic_id ?? "미지정";
    const group = epics.get(key) ?? [];
    group.push(t);
    epics.set(key, group);
  }

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...epics.entries()].map(([epicId, epicTasks]) => {
          const done = epicTasks.filter((t) => t.status === "done").length;
          const total = epicTasks.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div key={epicId} className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3 font-semibold">{epicId}</h3>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{done}/{total} 완료</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-3 flex gap-2">
                {(["in_progress", "review", "todo", "backlog"] as const).map((s) => {
                  const count = epicTasks.filter((t) => t.status === s).length;
                  if (!count) return null;
                  const sc = STATUS_COLORS[s];
                  return (
                    <span key={s} className={`text-xs ${sc.text}`}>{count} {s}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {epics.size === 0 && (
        <p className="text-muted-foreground">프로젝트가 없습니다.</p>
      )}
    </DashboardLayout>
  );
}
