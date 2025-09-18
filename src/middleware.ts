import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Allow public pages
  const publicPaths = ["/login", "/signup", "/verify-email", "/reset-password"];
  if (publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("access_token")?.value ?? null;
  if (!!authToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed", "/profile", "/settings"],
};
