import { Task, TaskStatus, STATUS_COLORS, PRIORITY_COLORS } from '@/data/types';

export function getStatusColor(status: TaskStatus): string {
  return STATUS_COLORS[status];
}

export function getPriorityColor(priority: Task['priority']): string {
  return PRIORITY_COLORS[priority];
}

export function countByStatus(tasks: Task[]): Record<TaskStatus, number> {
  return {
    'backlog': tasks.filter((t) => t.status === 'backlog').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    'review': tasks.filter((t) => t.status === 'review').length,
    'done': tasks.filter((t) => t.status === 'done').length,
  };
}

export function overallProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function daysBetween(a: string, b: string): number {
  return Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}
