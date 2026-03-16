'use client';

import { useUIStore } from '@/stores/useUIStore';
import { useTeamStore } from '@/stores/useTeamStore';
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSection } from '@/data/types';

const navItems: { id: SidebarSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'tasks', label: '태스크', icon: ListTodo },
  { id: 'team', label: '팀', icon: Users },
  { id: 'settings', label: '설정', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, sidebarSection, setSidebarSection } = useUIStore();
  const members = useTeamStore((s) => s.members);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
        {sidebarOpen && (
          <span className="text-lg font-bold tracking-tight text-white">SIRA</span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = sidebarSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSidebarSection(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              )}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Team Members */}
      {sidebarOpen && (
        <div className="border-t border-zinc-800 p-3">
          <p className="mb-2 text-xs font-medium text-zinc-500">팀 멤버</p>
          <div className="space-y-1.5">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm text-zinc-300">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.type === 'ai' ? <Bot size={12} /> : <User size={12} />}
                </div>
                <span className="truncate">{m.name}</span>
                {m.type === 'ai' && (
                  <span className="ml-auto rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-400">
                    AI
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
