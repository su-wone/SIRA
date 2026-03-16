'use client';

import { useUIStore } from '@/stores/useUIStore';
import { Search, Command } from 'lucide-react';

export function Header() {
  const { toggleCommandPalette, sidebarSection } = useUIStore();

  const titles: Record<string, string> = {
    dashboard: '대시보드',
    tasks: '태스크',
    team: '팀',
    settings: '설정',
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <h1 className="text-lg font-semibold text-white">
        {titles[sidebarSection] ?? '대시보드'}
      </h1>

      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
      >
        <Search size={14} />
        <span>검색 또는 명령...</span>
        <kbd className="ml-2 flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
          <Command size={10} />K
        </kbd>
      </button>
    </header>
  );
}
