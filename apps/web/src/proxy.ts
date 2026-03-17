import { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/tasks",
  "/gantt",
  "/members",
  "/projects",
  "/api/tasks",
  "/api/sse",
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next();
}
