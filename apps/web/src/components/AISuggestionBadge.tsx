"use client";

import { useState } from "react";
import { Sparkles, Check, X, ArrowRight } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";

interface SuggestionProps {
  taskId: string;
  currentStatus: string;
  suggestedStatus: string;
  reason: string;
}

export function AISuggestionBadge({ taskId, currentStatus, suggestedStatus, reason }: SuggestionProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { updateTask } = useTaskStore();

  if (dismissed) return null;

  async function handleAccept() {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: suggestedStatus }),
    });
    updateTask(taskId, { status: suggestedStatus });
    setDismissed(true);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-2.5 py-1 text-xs text-violet-400 hover:bg-violet-500/30 transition-colors"
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-medium">{taskId}</span>
        <ArrowRight className="h-3 w-3" />
        <span>{suggestedStatus}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-72 rounded-lg border border-violet-500/30 bg-card p-3 shadow-lg">
          <p className="mb-1 text-xs font-semibold text-violet-400">AI 제안 이유</p>
          <p className="mb-3 text-xs text-muted-foreground">{reason}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <span className="rounded bg-muted px-1.5 py-0.5">{currentStatus}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-violet-400">{suggestedStatus}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1 rounded bg-violet-500 px-2.5 py-1 text-xs text-white hover:bg-violet-600 transition-colors"
            >
              <Check className="h-3 w-3" />
              수락
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex items-center gap-1 rounded bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="h-3 w-3" />
              무시
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
