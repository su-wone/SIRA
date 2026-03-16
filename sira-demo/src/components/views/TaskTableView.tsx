'use client';

import { useTaskStore } from '@/stores/useTaskStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { useUIStore } from '@/stores/useUIStore';
import { mockEpics } from '@/data/mock-epics';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/data/types';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';

export function TaskTableView() {
  const tasks = useTaskStore((s) => s.tasks);
  const getMember = useTeamStore((s) => s.getMember);
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">제목</th>
            <th className="px-4 py-3 font-medium">상태</th>
            <th className="px-4 py-3 font-medium">우선순위</th>
            <th className="px-4 py-3 font-medium">에픽</th>
            <th className="px-4 py-3 font-medium">담당자</th>
            <th className="px-4 py-3 font-medium">진행률</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const assignee = getMember(task.assigneeId);
            const epic = mockEpics.find((e) => e.id === task.epicId);
            return (
              <tr
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{task.id}</td>
                <td className="px-4 py-3 text-zinc-200">{task.title}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className="border-0 text-[11px]"
                    style={{
                      backgroundColor: `${STATUS_COLORS[task.status]}20`,
                      color: STATUS_COLORS[task.status],
                    }}
                  >
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block h-2 w-2 rounded-full mr-1.5"
                    style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                  />
                  <span className="text-xs text-zinc-400">
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {epic && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: epic.color }}
                      />
                      {epic.title}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {assignee && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] text-white"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.type === 'ai' ? <Bot size={10} /> : <User size={10} />}
                      </span>
                      {assignee.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-green-500 transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{task.progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
