"use client";

import { useRef, useEffect, useCallback } from "react";
import type { TaskEntry } from "@/stores/useTaskStore";
import type { TeamMember } from "@/stores/useTeamStore";
import { getAvatarColor } from "@/lib/colors";

interface PixelOfficeProps {
  members: TeamMember[];
  tasks: TaskEntry[];
}

interface CharacterState {
  name: string;
  type: "human" | "ai";
  status: "working" | "idle" | "done" | "reviewing";
  taskTitle?: string;
  x: number;
  y: number;
  color: string;
  frame: number;
}

const DESK_W = 48;
const DESK_H = 32;
const PADDING = 80;

function getCharacterStatus(member: TeamMember, tasks: TaskEntry[]): { status: CharacterState["status"]; taskTitle?: string } {
  const assigned = tasks.filter((t) => t.assignee === member.name);
  const inProgress = assigned.find((t) => t.status === "in_progress");
  if (inProgress) return { status: "working", taskTitle: inProgress.title };
  const reviewing = assigned.find((t) => t.status === "review");
  if (reviewing) return { status: "reviewing", taskTitle: reviewing.title };
  const allDone = assigned.length > 0 && assigned.every((t) => t.status === "done");
  if (allDone) return { status: "done" };
  return { status: "idle" };
}

function hexFromTailwind(twColor: string): string {
  const map: Record<string, string> = {
    "bg-blue-600": "#2563eb",
    "bg-green-600": "#16a34a",
    "bg-purple-600": "#9333ea",
    "bg-pink-600": "#db2777",
    "bg-indigo-600": "#4f46e5",
    "bg-teal-600": "#0d9488",
    "bg-orange-600": "#ea580c",
    "bg-cyan-600": "#0891b2",
  };
  return map[twColor] ?? "#6366f1";
}

function drawCharacter(ctx: CanvasRenderingContext2D, char: CharacterState) {
  const { x, y, color, name, type, status, taskTitle, frame } = char;

  // Desk
  ctx.fillStyle = "#374151";
  ctx.fillRect(x - DESK_W / 2, y + 8, DESK_W, DESK_H);
  ctx.fillStyle = "#4b5563";
  ctx.fillRect(x - DESK_W / 2 + 2, y + 10, DESK_W - 4, 4);

  // Monitor on desk
  ctx.fillStyle = status === "working" ? "#22c55e" : status === "reviewing" ? "#a855f7" : "#1f2937";
  ctx.fillRect(x - 8, y - 2, 16, 12);
  ctx.fillStyle = "#111827";
  ctx.fillRect(x - 6, y, 12, 8);

  // Body (pixel character)
  const bodyColor = hexFromTailwind(color);
  ctx.fillStyle = bodyColor;

  // Head
  ctx.fillRect(x - 4, y - 20, 8, 8);

  // Body
  ctx.fillRect(x - 5, y - 12, 10, 10);

  // Arms - animate if working
  if (status === "working") {
    const armOffset = frame % 2 === 0 ? -2 : 0;
    ctx.fillRect(x - 8, y - 10 + armOffset, 3, 6);
    ctx.fillRect(x + 5, y - 10 - armOffset, 3, 6);
  } else {
    ctx.fillRect(x - 8, y - 10, 3, 6);
    ctx.fillRect(x + 5, y - 10, 3, 6);
  }

  // Eyes
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 3, y - 18, 2, 2);
  ctx.fillRect(x + 1, y - 18, 2, 2);

  // AI badge
  if (type === "ai") {
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(x + 4, y - 22, 8, 6);
    ctx.fillStyle = "#ffffff";
    ctx.font = "5px monospace";
    ctx.fillText("AI", x + 5, y - 17);
  }

  // Status indicator dot
  const dotColor = status === "working" ? "#eab308" : status === "reviewing" ? "#a855f7" : status === "done" ? "#22c55e" : "#6b7280";
  ctx.beginPath();
  ctx.arc(x + 6, y - 22, 3, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  // Name label
  ctx.fillStyle = "#d1d5db";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, y + DESK_H + 18);

  // Task tooltip
  if (taskTitle) {
    const label = taskTitle.length > 12 ? taskTitle.slice(0, 12) + "…" : taskTitle;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    const textW = ctx.measureText(label).width + 8;
    ctx.fillRect(x - textW / 2, y - 32, textW, 12);
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "8px sans-serif";
    ctx.fillText(label, x, y - 23);
  }
}

export function PixelOffice({ members, tasks }: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = Math.max(Math.ceil(Math.sqrt(members.length)), 2);
    const w = cols * PADDING + PADDING;
    const rows = Math.ceil(members.length / cols);
    const h = rows * (DESK_H + 60) + 60;

    canvas.width = w;
    canvas.height = h;

    // Background — office floor
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, w, h);

    // Grid pattern
    ctx.strokeStyle = "#1f2937";
    for (let gx = 0; gx < w; gx += 16) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 16) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Draw characters
    const characters: CharacterState[] = members.map((m, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const { status, taskTitle } = getCharacterStatus(m, tasks);
      return {
        name: m.name,
        type: m.type,
        status,
        taskTitle,
        x: PADDING / 2 + col * PADDING + PADDING / 2,
        y: 40 + row * (DESK_H + 60),
        color: getAvatarColor(m.name),
        frame: frameRef.current,
      };
    });

    for (const char of characters) {
      drawCharacter(ctx, char);
    }
  }, [members, tasks]);

  useEffect(() => {
    draw();
    const interval = setInterval(() => {
      frameRef.current++;
      draw();
    }, 800);
    return () => clearInterval(interval);
  }, [draw]);

  if (members.length === 0) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-card px-4 py-2">
        <h2 className="text-sm font-medium">Pixel Office</h2>
      </div>
      <div className="flex justify-center bg-gray-900 p-4">
        <canvas ref={canvasRef} className="image-rendering-pixelated" />
      </div>
    </div>
  );
}
