"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore } from "@/stores/useTaskStore";
import { STATUS_COLORS, PRIORITY_COLORS, getInitials, getAvatarColor } from "@/lib/colors";

const COLUMNS = ["backlog", "todo", "in_progress", "review", "done"] as const;

export default function KanbanPage() {
  const { tasks, setTasks, updateTask } = useTaskStore();

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setTasks(res.data.tasks ?? []);
      });
  }, [setTasks]);

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Kanban</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const sc = STATUS_COLORS[status];
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              className="flex w-72 flex-shrink-0 flex-col rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${sc.dot}`} />
                <span className="text-sm font-medium">{status}</span>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {columnTasks.map((t) => {
                  const pc = PRIORITY_COLORS[t.priority] ?? "";
                  return (
                    <Link
                      key={t.id}
                      href={`/tasks/${t.id}`}
                      className="rounded-md border border-border bg-card p-3 transition-colors hover:border-accent"
                    >
                      <p className="text-sm font-medium">{t.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-xs font-medium ${pc}`}>{t.priority}</span>
                        {t.assignee && (
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${getAvatarColor(t.assignee)}`}
                            title={t.assignee}
                          >
                            {getInitials(t.assignee)}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
