// === Enums & Constants ===

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskType = 'feature' | 'bug' | 'chore' | 'spike';
export type MemberType = 'human' | 'ai';
export type MemberRole = 'admin' | 'member' | 'viewer';

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'backlog': '#6B7280',
  'in-progress': '#EAB308',
  'review': '#A855F7',
  'done': '#22C55E',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  'critical': '#EF4444',
  'high': '#F97316',
  'medium': '#EAB308',
  'low': '#6B7280',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'backlog': '백로그',
  'in-progress': '진행중',
  'review': '리뷰',
  'done': '완료',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  'critical': '긴급',
  'high': '높음',
  'medium': '보통',
  'low': '낮음',
};

// === Interfaces ===

export interface TeamMember {
  id: string;
  name: string;
  type: MemberType;
  role: MemberRole;
  avatar: string; // initials or emoji
  color: string;  // avatar background color
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  epicId: string;
  assigneeId: string;
  createdAt: string;   // ISO date
  startDate?: string;  // ISO date — for Gantt
  dueDate?: string;    // ISO date — for Gantt
  progress: number;    // 0-100
  tags: string[];
}

export interface Epic {
  id: string;
  title: string;
  color: string;
  description: string;
}

// === View Types ===

export type ViewMode = 'table' | 'kanban' | 'gantt';
export type SidebarSection = 'dashboard' | 'tasks' | 'team' | 'settings';
