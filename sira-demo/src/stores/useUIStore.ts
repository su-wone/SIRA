import { create } from 'zustand';
import { ViewMode, SidebarSection } from '@/data/types';

interface UIStore {
  sidebarOpen: boolean;
  sidebarSection: SidebarSection;
  viewMode: ViewMode;
  commandPaletteOpen: boolean;
  selectedEpicId: string | null;
  selectedTaskId: string | null;
  searchQuery: string;

  toggleSidebar: () => void;
  setSidebarSection: (section: SidebarSection) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedEpicId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  sidebarSection: 'dashboard',
  viewMode: 'table',
  commandPaletteOpen: false,
  selectedEpicId: null,
  selectedTaskId: null,
  searchQuery: '',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarSection: (section) => set({ sidebarSection: section }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setSelectedEpicId: (id) => set({ selectedEpicId: id }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
