export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/gantt/:path*",
    "/members/:path*",
    "/projects/:path*",
    "/api/tasks/:path*",
    "/api/sse/:path*",
  ],
};
