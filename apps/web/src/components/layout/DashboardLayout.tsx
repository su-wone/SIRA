"use client";

import { Sidebar } from "./Sidebar";
import { useUIStore } from "@/stores/useUIStore";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={`transition-all duration-200 ${
          sidebarOpen ? "ml-56" : "ml-14"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
