import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, expectedSessionValue } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const expected = await expectedSessionValue();

  // No DASHBOARD_PASSWORD configured (e.g. local dev) — leave the gate open.
  if (!expected) return NextResponse.next();

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session === expected) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
