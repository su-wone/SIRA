'use client';

import { useUIStore } from '@/stores/useUIStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { mockEpics } from '@/data/mock-epics';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TaskStatus,
} from '@/data/types';
import { formatDate } from '@/lib/task-utils';
import { Badge } from '@/components/ui/badge';
import { Bot, User, X, Calendar, Flag, Layers, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALL_STATUSES: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

export function TaskDetailPanel() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const updateTaskProgress = useTaskStore((s) => s.updateTaskProgress);
  const getMember = useTeamStore((s) => s.getMember);

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const assignee = getMember(task.assigneeId);
  const epic = mockEpics.find((e) => e.id === task.epicId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setSelectedTaskId(null)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <span className="font-mono text-sm text-zinc-500">{task.id}</span>
          <button
            onClick={() => setSelectedTaskId(null)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-white leading-snug">{task.title}</h2>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed">{task.description}</p>

          {/* Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Flag size={12} />
              상태
            </label>
            <div className="flex gap-1.5">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateTaskStatus(task.id, s)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs transition-colors border',
                    task.status === s
                      ? 'border-transparent text-white'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  )}
                  style={
                    task.status === s
                      ? {
                          backgroundColor: `${STATUS_COLORS[s]}30`,
                          color: STATUS_COLORS[s],
                        }
                      : undefined
                  }
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Flag size={12} />
              우선순위
            </label>
            <Badge
              variant="outline"
              className="border-0"
              style={{
                backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                color: PRIORITY_COLORS[task.priority],
              }}
            >
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <User size={12} />
              담당자
            </label>
            {assignee && (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-white"
                  style={{ backgroundColor: assignee.color }}
                >
                  {assignee.type === 'ai' ? <Bot size={13} /> : <User size={13} />}
                </div>
                <div>
                  <p className="text-sm text-zinc-200">{assignee.name}</p>
                  <p className="text-[11px] text-zinc-500 capitalize">
                    {assignee.type === 'ai' ? 'AI Agent' : assignee.role}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Epic */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Layers size={12} />
              에픽
            </label>
            {epic && (
              <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: epic.color }}
                />
                {epic.title}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>진행률</span>
              <span className="text-white">{task.progress}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={task.progress}
              onChange={(e) => updateTaskProgress(task.id, Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          {/* Dates */}
          {(task.startDate || task.dueDate) && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <Calendar size={12} />
                일정
              </label>
              <div className="flex gap-4 text-sm text-zinc-300">
                {task.startDate && (
                  <span>시작: {formatDate(task.startDate)}</span>
                )}
                {task.dueDate && (
                  <span>마감: {formatDate(task.dueDate)}</span>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <Tag size={12} />
                태그
              </label>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500">타입</label>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400 capitalize">
              {task.type}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
