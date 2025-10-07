import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const { pathname } = request.nextUrl;
  const protectedPrefixes = ["/tools", "/dashboard", "/admin"];
  const isTryingToAccessProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isTryingToAccessProtectedRoute) {
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const userRole = session.user.role;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tools/:path*", "/dashboard/:path*", "/admin/:path*"],
};