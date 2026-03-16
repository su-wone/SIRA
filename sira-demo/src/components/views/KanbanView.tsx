'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTeamStore } from '@/stores/useTeamStore';
import { useUIStore } from '@/stores/useUIStore';
import { Task, TaskStatus, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '@/data/types';
import { Bot, User, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLUMNS: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

function TaskCard({ task, overlay }: { task: Task; overlay?: boolean }) {
  const getMember = useTeamStore((s) => s.getMember);
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId);
  const assignee = getMember(task.assigneeId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = overlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-zinc-700 bg-zinc-800 p-3 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30',
        overlay && 'shadow-2xl rotate-2'
      )}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 text-zinc-600 hover:text-zinc-400">
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-mono text-[10px] text-zinc-500">{task.id}</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
            />
          </div>
          <p
            className="text-sm text-zinc-200 leading-snug cursor-pointer hover:text-white"
            onClick={() => setSelectedTaskId(task.id)}
          >
            {task.title}
          </p>
          <div className="mt-2 flex items-center justify-between">
            {assignee && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white"
                  style={{ backgroundColor: assignee.color }}
                >
                  {assignee.type === 'ai' ? <Bot size={8} /> : <User size={8} />}
                </span>
                {assignee.name}
              </span>
            )}
            <span className="text-[10px] text-zinc-500">{task.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KanbanView() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Dropped on a column
    if (COLUMNS.includes(overId as TaskStatus)) {
      updateTaskStatus(taskId, overId as TaskStatus);
      return;
    }

    // Dropped on another task — move to that task's column
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      updateTaskStatus(taskId, overTask.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="flex flex-col">
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-sm font-medium text-zinc-300">
                  {STATUS_LABELS[status]}
                </span>
                <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                  {columnTasks.length}
                </span>
              </div>
              <SortableContext
                id={status}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-2 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-2 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
