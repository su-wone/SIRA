"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTaskStore, type TaskEntry } from "@/stores/useTaskStore";
import { STATUS_COLORS, PRIORITY_COLORS, getInitials, getAvatarColor } from "@/lib/colors";

const COLUMNS = ["backlog", "todo", "in_progress", "review", "done"] as const;

export default function KanbanPage() {
  const { tasks, setTasks, updateTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<TaskEntry | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setTasks(res.data.tasks ?? []);
      });
  }, [setTasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    updateTask(taskId, { status: newStatus });

    // Persist to server
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert on failure
      updateTask(taskId, { status: task.status });
    }
  }

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Kanban</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </DashboardLayout>
  );
}

function KanbanColumn({ status, tasks }: { status: string; tasks: TaskEntry[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const sc = STATUS_COLORS[status] ?? STATUS_COLORS.backlog;

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 flex-shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors ${
        isOver ? "border-accent bg-accent/10" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${sc.dot}`} />
        <span className="text-sm font-medium">{status}</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
          {tasks.length}
        </span>
      </div>
      <div className="flex min-h-[100px] flex-col gap-2 p-2">
        {tasks.map((t) => (
          <DraggableTask key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}

function DraggableTask({ task }: { task: TaskEntry }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task, isOverlay }: { task: TaskEntry; isOverlay?: boolean }) {
  const pc = PRIORITY_COLORS[task.priority] ?? "";

  return (
    <div
      className={`rounded-md border border-border bg-card p-3 transition-colors ${
        isOverlay ? "shadow-xl ring-2 ring-accent" : "hover:border-accent"
      }`}
    >
      <Link href={`/tasks/${task.id}`} onClick={(e) => isOverlay && e.preventDefault()}>
        <p className="text-sm font-medium">{task.title}</p>
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs font-medium ${pc}`}>{task.priority}</span>
        {task.assignee && (
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${getAvatarColor(task.assignee)}`}
            title={task.assignee}
          >
            {getInitials(task.assignee)}
          </div>
        )}
      </div>
    </div>
  );
}
