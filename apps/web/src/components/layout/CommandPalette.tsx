"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { Search } from "lucide-react";

const NAV_COMMANDS = [
  { id: "nav-dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "nav-tasks", label: "Tasks", href: "/tasks" },
  { id: "nav-kanban", label: "Kanban", href: "/tasks/kanban" },
  { id: "nav-gantt", label: "Gantt", href: "/gantt" },
  { id: "nav-members", label: "Members", href: "/members" },
  { id: "nav-projects", label: "Projects", href: "/projects" },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { tasks } = useTaskStore();
  const [query, setQuery] = useState("");

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery("");
  }, [setCommandPaletteOpen]);

  // Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, close]);

  if (!commandPaletteOpen) return null;

  const lowerQuery = query.toLowerCase();
  const filteredNav = NAV_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(lowerQuery),
  );
  const filteredTasks = tasks
    .filter(
      (t) =>
        t.id.toLowerCase().includes(lowerQuery) ||
        t.title.toLowerCase().includes(lowerQuery) ||
        (t.assignee?.toLowerCase().includes(lowerQuery) ?? false),
    )
    .slice(0, 8);

  function select(href: string) {
    router.push(href);
    close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50" onClick={close} />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색 또는 명령..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredNav.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs text-muted-foreground">페이지</p>
              {filteredNav.map((c) => (
                <button
                  key={c.id}
                  onClick={() => select(c.href)}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {filteredTasks.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs text-muted-foreground">태스크</p>
              {filteredTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => select(`/tasks/${t.id}`)}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                  <span className="ml-2">{t.title}</span>
                </button>
              ))}
            </div>
          )}
          {filteredNav.length === 0 && filteredTasks.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              결과가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
