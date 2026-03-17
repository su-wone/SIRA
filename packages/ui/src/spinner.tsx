import type { HTMLAttributes } from "react";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        "animate-spin rounded-full border-current border-t-transparent",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export { Spinner };
export type { SpinnerProps };
