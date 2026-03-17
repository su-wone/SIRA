"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">오류가 발생했습니다</h1>
        <p className="mb-6 text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
