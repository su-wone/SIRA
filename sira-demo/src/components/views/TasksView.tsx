'use client';

import { useUIStore } from '@/stores/useUIStore';
import { TaskTableView } from './TaskTableView';
import { KanbanView } from './KanbanView';
import { GanttView } from './GanttView';
import { ViewMode } from '@/data/types';
import { Table2, Kanban, GanttChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const viewOptions: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'table', label: '테이블', icon: Table2 },
  { id: 'kanban', label: '칸반', icon: Kanban },
  { id: 'gantt', label: '간트', icon: GanttChart },
];

export function TasksView() {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 w-fit">
        {viewOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setViewMode(opt.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                viewMode === opt.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Icon size={14} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* View Content */}
      {viewMode === 'table' && <TaskTableView />}
      {viewMode === 'kanban' && <KanbanView />}
      {viewMode === 'gantt' && <GanttView />}
    </div>
  );
}
