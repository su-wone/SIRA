'use client';

import { useTeamStore } from '@/stores/useTeamStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { countByStatus } from '@/lib/task-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';

export function TeamView() {
  const members = useTeamStore((s) => s.members);
  const tasks = useTaskStore((s) => s.tasks);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
        const statusCounts = countByStatus(memberTasks);
        return (
          <Card key={member.id} className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.type === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div>
                  <p className="font-medium text-white">{member.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-500 capitalize">{member.role}</span>
                    {member.type === 'ai' && (
                      <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-400">
                        AI Agent
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>할당된 태스크</span>
                  <span className="text-white font-medium">{memberTasks.length}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>진행중</span>
                  <span className="text-yellow-400">{statusCounts['in-progress']}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>완료</span>
                  <span className="text-green-400">{statusCounts.done}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
