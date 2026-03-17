export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"></div>
        </div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
