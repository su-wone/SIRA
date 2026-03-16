'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { mockEpics } from '@/data/mock-epics';
import { STATUS_COLORS, STATUS_LABELS } from '@/data/types';
import { Bot, User } from 'lucide-react';
import { daysBetween } from '@/lib/task-utils';

export function GanttView() {
  const tasks = useTaskStore((s) => s.tasks);
  const getMember = useTeamStore((s) => s.getMember);

  const ganttTasks = useMemo(
    () => tasks.filter((t) => t.startDate && t.dueDate),
    [tasks]
  );

  const { timelineStart, totalDays, weeks } = useMemo(() => {
    if (ganttTasks.length === 0) {
      return { timelineStart: new Date(), totalDays: 30, weeks: [] };
    }
    const dates = ganttTasks.flatMap((t) => [new Date(t.startDate!), new Date(t.dueDate!)]);
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    // Pad by 2 days each side
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 2);
    const total = daysBetween(min.toISOString(), max.toISOString());

    const wks: { label: string; startCol: number; span: number }[] = [];
    const cursor = new Date(min);
    while (cursor <= max) {
      const weekStart = new Date(cursor);
      const col = daysBetween(min.toISOString(), cursor.toISOString());
      // Jump to next Monday
      const daysToMon = (8 - cursor.getDay()) % 7 || 7;
      cursor.setDate(cursor.getDate() + daysToMon);
      const span = Math.min(daysToMon, total - col);
      wks.push({
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        startCol: col,
        span: Math.max(span, 1),
      });
    }

    return { timelineStart: min, totalDays: total, weeks: wks };
  }, [ganttTasks]);

  if (ganttTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        간트 뷰에 표시할 태스크가 없습니다. (startDate/dueDate 필요)
      </div>
    );
  }

  const COL_WIDTH = 28;

  // Group by epic
  const grouped = mockEpics.map((epic) => ({
    epic,
    tasks: ganttTasks.filter((t) => t.epicId === epic.id),
  }));

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="min-w-max">
        {/* Header — week labels */}
        <div className="flex border-b border-zinc-800">
          <div className="w-72 shrink-0 border-r border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-500">
            태스크
          </div>
          <div className="relative flex-1" style={{ width: totalDays * COL_WIDTH }}>
            <div className="flex">
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className="border-r border-zinc-800/50 px-1 py-2 text-center text-[10px] text-zinc-500"
                  style={{ width: w.span * COL_WIDTH }}
                >
                  {w.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        {grouped.map(({ epic, tasks: epicTasks }) => (
          <div key={epic.id}>
            {/* Epic header */}
            <div className="flex items-center border-b border-zinc-800/50 bg-zinc-950/50">
              <div className="w-72 shrink-0 border-r border-zinc-800 px-4 py-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: epic.color }} />
                  {epic.title}
                </span>
              </div>
              <div style={{ width: totalDays * COL_WIDTH }} />
            </div>

            {/* Task rows */}
            {epicTasks.map((task) => {
              const assignee = getMember(task.assigneeId);
              const startOffset = daysBetween(
                timelineStart.toISOString(),
                task.startDate!
              );
              const duration = daysBetween(task.startDate!, task.dueDate!);

              return (
                <div
                  key={task.id}
                  className="flex items-center border-b border-zinc-800/30 hover:bg-zinc-800/20"
                >
                  {/* Task info */}
                  <div className="w-72 shrink-0 border-r border-zinc-800 px-4 py-2">
                    <div className="flex items-center gap-2">
                      {assignee && (
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] text-white shrink-0"
                          style={{ backgroundColor: assignee.color }}
                        >
                          {assignee.type === 'ai' ? <Bot size={9} /> : <User size={9} />}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-300 truncate">{task.title}</p>
                        <span className="text-[10px] text-zinc-500">{task.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gantt bar */}
                  <div
                    className="relative h-10 flex-1"
                    style={{ width: totalDays * COL_WIDTH }}
                  >
                    <div
                      className="absolute top-2 h-6 rounded-md flex items-center px-2 text-[10px] text-white font-medium"
                      style={{
                        left: startOffset * COL_WIDTH,
                        width: Math.max(duration * COL_WIDTH, COL_WIDTH),
                        backgroundColor: `${STATUS_COLORS[task.status]}40`,
                        borderLeft: `3px solid ${STATUS_COLORS[task.status]}`,
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute inset-0 rounded-md opacity-30"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: STATUS_COLORS[task.status],
                        }}
                      />
                      <span className="relative z-10">
                        {STATUS_LABELS[task.status]} {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
