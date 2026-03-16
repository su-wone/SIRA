"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  GanttChart,
  Users,
  FolderKanban,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/tasks/kanban", label: "Kanban", icon: Columns3 },
  { href: "/gantt", label: "Gantt", icon: GanttChart },
  { href: "/members", label: "Members", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-200 ${
        sidebarOpen ? "w-56" : "w-14"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {sidebarOpen && (
          <span className="text-lg font-bold tracking-tight">SIRA</span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
