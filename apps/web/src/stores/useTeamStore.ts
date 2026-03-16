"use client";

import { create } from "zustand";

export interface TeamMember {
  name: string;
  role: "admin" | "member" | "agent";
  type: "human" | "ai";
  github_username?: string;
}

interface TeamStore {
  members: TeamMember[];
  setMembers: (members: TeamMember[]) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
}));
