import { create } from 'zustand';
import { TeamMember } from '@/data/types';
import { mockMembers } from '@/data/mock-members';

interface TeamStore {
  members: TeamMember[];
  getMember: (id: string) => TeamMember | undefined;
  getHumans: () => TeamMember[];
  getAgents: () => TeamMember[];
}

export const useTeamStore = create<TeamStore>((_, get) => ({
  members: mockMembers,
  getMember: (id) => get().members.find((m) => m.id === id),
  getHumans: () => get().members.filter((m) => m.type === 'human'),
  getAgents: () => get().members.filter((m) => m.type === 'ai'),
}));
