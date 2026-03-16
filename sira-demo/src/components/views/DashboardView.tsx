'use client';

import { useTaskStore } from '@/stores/useTaskStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { mockEpics } from '@/data/mock-epics';
import { countByStatus, overallProgress } from '@/lib/task-utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NaturalLanguageInput } from '@/components/NaturalLanguageInput';
import { Bot, User, ListTodo, TrendingUp } from 'lucide-react';

export function DashboardView() {
  const tasks = useTaskStore((s) => s.tasks);
  const members = useTeamStore((s) => s.members);
  const statusCounts = countByStatus(tasks);
  const progress = overallProgress(tasks);
  const humans = members.filter((m) => m.type === 'human');
  const agents = members.filter((m) => m.type === 'ai');

  return (
    <div className="space-y-6">
      {/* AI Natural Language Input */}
      <NaturalLanguageInput />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">전체 태스크</CardTitle>
            <ListTodo size={16} className="text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <p className="text-xs text-zinc-500 mt-1">
              완료 {statusCounts.done} / 진행중 {statusCounts['in-progress']}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">전체 진행률</CardTitle>
            <TrendingUp size={16} className="text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{progress}%</div>
            <div className="mt-2 h-2 rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">인간 팀원</CardTitle>
            <User size={16} className="text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{humans.length}</div>
            <p className="text-xs text-zinc-500 mt-1">
              {humans.map((h) => h.name).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">AI 에이전트</CardTitle>
            <Bot size={16} className="text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{agents.length}</div>
            <p className="text-xs text-zinc-500 mt-1">
              {agents.map((a) => a.name).join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">상태별 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-sm text-zinc-300">{STATUS_LABELS[status]}</span>
                <span className="text-sm font-semibold text-white">{statusCounts[status]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Epics Overview */}
      <div className="grid grid-cols-3 gap-4">
        {mockEpics.map((epic) => {
          const epicTasks = tasks.filter((t) => t.epicId === epic.id);
          const epicProgress = overallProgress(epicTasks);
          const epicStatus = countByStatus(epicTasks);
          return (
            <Card key={epic.id} className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: epic.color }} />
                  <CardTitle className="text-sm font-medium text-white">{epic.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-500 mb-3">{epic.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">{epicTasks.length}개 태스크</span>
                  <span className="text-xs font-medium text-white">{epicProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${epicProgress}%`, backgroundColor: epic.color }}
                  />
                </div>
                <div className="mt-2 flex gap-3 text-[10px] text-zinc-500">
                  <span>완료 {epicStatus.done}</span>
                  <span>진행 {epicStatus['in-progress']}</span>
                  <span>리뷰 {epicStatus.review}</span>
                  <span>백로그 {epicStatus.backlog}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
