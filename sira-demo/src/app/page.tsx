'use client';

import { AppShell } from '@/components/layout/AppShell';
import { CommandPalette } from '@/components/CommandPalette';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { DashboardView } from '@/components/views/DashboardView';
import { TasksView } from '@/components/views/TasksView';
import { TeamView } from '@/components/views/TeamView';
import { useUIStore } from '@/stores/useUIStore';

export default function Home() {
  const sidebarSection = useUIStore((s) => s.sidebarSection);

  return (
    <AppShell>
      {sidebarSection === 'dashboard' && <DashboardView />}
      {sidebarSection === 'tasks' && <TasksView />}
      {sidebarSection === 'team' && <TeamView />}
      {sidebarSection === 'settings' && (
        <div className="flex items-center justify-center h-full text-zinc-500">
          설정 페이지 (준비중)
        </div>
      )}
      <CommandPalette />
      <TaskDetailPanel />
    </AppShell>
  );
}
