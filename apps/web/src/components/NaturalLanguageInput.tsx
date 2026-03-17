"use client";

import { useState, useRef } from "react";
import { useTaskStore, type TaskEntry } from "@/stores/useTaskStore";
import { Sparkles, Send, Loader2, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeneratedTask {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  area: "web" | "server" | "shared";
  epic_id: string;
  assignee: string;
  tags: string[];
}

// 시뮬레이션용 — 입력에 따라 태스크를 자동 생성하는 것처럼 보여줌
function simulateAIResponse(input: string): GeneratedTask[] {
  const lower = input.toLowerCase();

  if (lower.includes("로그인") || lower.includes("인증") || lower.includes("auth")) {
    return [
      {
        title: "로그인 폼 유효성 검증 강화",
        description: "이메일 형식, 비밀번호 규칙 등 클라이언트 사이드 유효성 검증 추가",
        priority: "high",
        area: "web",
        epic_id: "epic-1",
        assignee: "ai-2",
        tags: ["auth", "validation"],
      },
      {
        title: "로그인 시도 횟수 제한 구현",
        description: "5회 실패 시 계정 잠금 및 이메일 알림 발송",
        priority: "critical",
        area: "server",
        epic_id: "epic-1",
        assignee: "ai-1",
        tags: ["auth", "security"],
      },
      {
        title: "비밀번호 재설정 플로우",
        description: "이메일 기반 비밀번호 재설정 링크 발송 및 처리",
        priority: "medium",
        area: "shared",
        epic_id: "epic-1",
        assignee: "human-2",
        tags: ["auth", "ux"],
      },
    ];
  }

  if (lower.includes("결제") || lower.includes("payment") || lower.includes("빌링")) {
    return [
      {
        title: "결제 영수증 PDF 생성",
        description: "결제 완료 후 PDF 영수증 자동 생성 및 이메일 발송",
        priority: "medium",
        area: "server",
        epic_id: "epic-2",
        assignee: "ai-1",
        tags: ["payment", "pdf"],
      },
      {
        title: "환불 처리 API 구현",
        description: "Stripe 환불 API 연동 및 부분 환불 지원",
        priority: "high",
        area: "server",
        epic_id: "epic-2",
        assignee: "human-1",
        tags: ["payment", "api"],
      },
    ];
  }

  if (lower.includes("대시보드") || lower.includes("차트") || lower.includes("분석")) {
    return [
      {
        title: "주간 생산성 리포트 자동 생성",
        description: "매주 월요일 팀 생산성 요약 리포트를 자동 생성하여 슬랙 전송",
        priority: "medium",
        area: "server",
        epic_id: "epic-3",
        assignee: "ai-3",
        tags: ["analytics", "automation"],
      },
      {
        title: "번다운 차트 위젯",
        description: "스프린트 번다운 차트를 대시보드 위젯으로 추가",
        priority: "high",
        area: "web",
        epic_id: "epic-3",
        assignee: "ai-2",
        tags: ["analytics", "chart"],
      },
    ];
  }

  // 기본 응답
  return [
    {
      title: input.length > 40 ? input.slice(0, 40) + "..." : input,
      description: `사용자 요청: "${input}"에 대한 구현 태스크`,
      priority: "medium",
      area: "shared",
      epic_id: "epic-3",
      assignee: "ai-1",
      tags: ["user-request"],
    },
    {
      title: `${input.slice(0, 20)} — 테스트 작성`,
      description: `"${input}" 관련 기능의 단위 테스트 및 통합 테스트 작성`,
      priority: "low",
      area: "shared",
      epic_id: "epic-3",
      assignee: "ai-2",
      tags: ["test"],
    },
  ];
}

export function NaturalLanguageInput() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tasks = useTaskStore((s) => s.tasks);
  const setTasks = useTaskStore((s) => s.setTasks);

  async function handleSubmit() {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setGeneratedTasks([]);
    setAddedIds(new Set());

    // 타이핑 효과를 위한 딜레이
    await new Promise((r) => setTimeout(r, 1500));

    const results = simulateAIResponse(input);
    setGeneratedTasks(results);
    setIsProcessing(false);
  }

  function handleAddTask(genTask: GeneratedTask, index: number) {
    const now = new Date().toISOString();
    const nextId = tasks.length + addedIds.size + 1;
    const newTask: TaskEntry = {
      id: `SIRA-${String(nextId).padStart(3, "0")}`,
      title: genTask.title,
      status: "backlog",
      priority: genTask.priority,
      area: genTask.area,
      epic_id: genTask.epic_id,
      assignee: genTask.assignee,
      tags: genTask.tags,
      related_files: [],
      created_at: now,
      updated_at: now,
      file_path: "",
    };
    setTasks([...tasks, newTask]);
    setAddedIds((prev) => new Set(prev).add(index));
  }

  function handleAddAll() {
    generatedTasks.forEach((t, i) => {
      if (!addedIds.has(i)) handleAddTask(t, i);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-md bg-violet-500/20 p-2">
            <Sparkles size={16} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-zinc-300">AI 태스크 생성</p>
            <p className="mb-3 text-xs text-zinc-500">
              자연어로 원하는 기능을 설명하면, AI가 에픽/태스크를 자동으로 분해합니다.
            </p>
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="예: 로그인 보안을 강화하고 싶어. 비밀번호 재설정도 필요해."
                rows={2}
                className="flex-1 resize-none rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className="self-end bg-violet-600 hover:bg-violet-500 text-white"
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </Button>
            </div>
            <div className="mt-2 flex gap-2">
              {["로그인 보안 강화", "결제 환불 기능 추가", "대시보드 차트 개선"].map((example) => (
                <button
                  key={example}
                  onClick={() => setInput(example)}
                  className="rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3">
          <Loader2 size={16} className="animate-spin text-violet-400" />
          <div>
            <p className="text-sm text-violet-300">AI가 태스크를 분석하고 있습니다...</p>
            <p className="text-xs text-zinc-500">입력을 에픽/스토리/태스크로 분해 중</p>
          </div>
        </div>
      )}

      {/* Generated Tasks */}
      {generatedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-300">
              <Sparkles size={14} className="mr-1.5 inline text-violet-400" />
              AI가 {generatedTasks.length}개 태스크를 생성했습니다
            </p>
            <Button
              onClick={handleAddAll}
              disabled={addedIds.size === generatedTasks.length}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-xs"
            >
              <Plus size={12} className="mr-1" />
              전체 추가
            </Button>
          </div>

          {generatedTasks.map((task, i) => {
            const isAdded = addedIds.has(i);
            return (
              <div
                key={i}
                className={cn(
                  "rounded-lg border bg-zinc-900 p-3 transition-all",
                  isAdded ? "border-green-500/30 bg-green-500/5" : "border-zinc-800"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          task.priority === "critical"
                            ? "bg-red-500/20 text-red-400"
                            : task.priority === "high"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-zinc-700 text-zinc-400"
                        )}
                      >
                        {task.priority}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                        {task.area}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-200">{task.title}</p>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{task.description}</p>
                    <div className="mt-2 flex gap-1.5">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddTask(task, i)}
                    disabled={isAdded}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "shrink-0 border-zinc-700",
                      isAdded && "border-green-500/30 text-green-400"
                    )}
                  >
                    {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
