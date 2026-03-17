import type { HTMLAttributes } from "react";

type IssueStatus = "backlog" | "todo" | "in_progress" | "review" | "done" | "cancelled";

const statusClasses: Record<IssueStatus, string> = {
  backlog: "bg-gray-400",
  todo: "bg-slate-500",
  in_progress: "bg-blue-500",
  review: "bg-purple-500",
  done: "bg-green-500",
  cancelled: "bg-gray-300",
};

interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status: IssueStatus;
}

function StatusDot({ status, className, ...props }: StatusDotProps) {
  return (
    <span
      aria-label={status}
      className={[
        "inline-block size-2 rounded-full",
        statusClasses[status],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export { StatusDot };
export type { StatusDotProps, IssueStatus };
