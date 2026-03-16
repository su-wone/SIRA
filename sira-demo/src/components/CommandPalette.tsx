'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useTaskStore } from '@/stores/useTaskStore';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Table2,
  Kanban,
  GanttChart,
  Search,
} from 'lucide-react';
import { STATUS_LABELS } from '@/data/types';

export function CommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    setCommandPaletteOpen,
    setSidebarSection,
    setViewMode,
    setSelectedTaskId,
  } = useUIStore();
  const tasks = useTaskStore((s) => s.tasks);

  // Cmd+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggleCommandPalette]);

  function close() {
    setCommandPaletteOpen(false);
  }

  function run(fn: () => void) {
    fn();
    close();
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <Command className="rounded-lg border-0 bg-transparent">
        <CommandInput placeholder="명령 또는 태스크 검색..." />
        <CommandList>
          <CommandEmpty>결과 없음</CommandEmpty>

          <CommandGroup heading="네비게이션">
            <CommandItem onSelect={() => run(() => setSidebarSection('dashboard'))}>
              <LayoutDashboard size={14} className="mr-2" />
              대시보드
            </CommandItem>
            <CommandItem onSelect={() => run(() => setSidebarSection('tasks'))}>
              <ListTodo size={14} className="mr-2" />
              태스크
            </CommandItem>
            <CommandItem onSelect={() => run(() => setSidebarSection('team'))}>
              <Users size={14} className="mr-2" />
              팀
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="뷰 전환">
            <CommandItem
              onSelect={() =>
                run(() => {
                  setSidebarSection('tasks');
                  setViewMode('table');
                })
              }
            >
              <Table2 size={14} className="mr-2" />
              테이블 뷰
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => {
                  setSidebarSection('tasks');
                  setViewMode('kanban');
                })
              }
            >
              <Kanban size={14} className="mr-2" />
              칸반 뷰
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => {
                  setSidebarSection('tasks');
                  setViewMode('gantt');
                })
              }
            >
              <GanttChart size={14} className="mr-2" />
              간트 뷰
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="태스크">
            {tasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() =>
                  run(() => {
                    setSidebarSection('tasks');
                    setSelectedTaskId(task.id);
                  })
                }
              >
                <Search size={14} className="mr-2 text-zinc-500" />
                <span className="font-mono text-[11px] text-zinc-500 mr-2">{task.id}</span>
                <span className="truncate">{task.title}</span>
                <span className="ml-auto text-[10px] text-zinc-500">
                  {STATUS_LABELS[task.status]}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
