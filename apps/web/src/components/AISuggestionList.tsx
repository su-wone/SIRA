"use client";

import { Sparkles } from "lucide-react";
import { AISuggestionBadge } from "./AISuggestionBadge";

interface StatusSuggestion {
  taskId: string;
  currentStatus: string;
  suggestedStatus: string;
  reason: string;
}

interface Props {
  suggestions: StatusSuggestion[];
}

export function AISuggestionList({ suggestions }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-violet-500/20 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h2 className="text-sm font-semibold text-violet-400">AI 상태 제안</h2>
        <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-400">
          {suggestions.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <AISuggestionBadge
            key={s.taskId}
            taskId={s.taskId}
            currentStatus={s.currentStatus}
            suggestedStatus={s.suggestedStatus}
            reason={s.reason}
          />
        ))}
      </div>
    </div>
  );
}
