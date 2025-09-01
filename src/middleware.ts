import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const authToken = request.cookies.get("access_token")?.value ?? null;

  // Check if the user is authenticated (has a token)
  const isAuthenticated = Boolean(authToken);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed", "/profile", "/settings"],
};
