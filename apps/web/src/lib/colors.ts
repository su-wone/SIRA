// SIRA 상태 색상 체계 (UX5)
export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  backlog:     { bg: "bg-gray-500/10",   text: "text-gray-400",   dot: "bg-gray-500" },
  todo:        { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-500" },
  in_progress: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
  review:      { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500" },
  done:        { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-500" },
  cancelled:   { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-500" },
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400",
  high:     "text-orange-400",
  medium:   "text-yellow-400",
  low:      "text-gray-400",
};

export function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-pink-600",
  "bg-indigo-600", "bg-teal-600", "bg-orange-600", "bg-cyan-600",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
