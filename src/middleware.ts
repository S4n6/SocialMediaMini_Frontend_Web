import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const publicPaths = [
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const isPublicPath = publicPaths.some((path) =>
    path === "/" ? pathname === "/" : pathname.includes(path)
  );

  const authToken =
    request.cookies.get("access_token") || request.cookies.get("refresh_token");
  const isAuthenticated = Boolean(authToken?.value);

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);

    if (pathname !== "/" && pathname !== "/login") {
      loginUrl.searchParams.set("redirect", pathname + search);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname.startsWith("/login")) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const targetUrl = new URL(redirectTo || "/", request.url);
    return NextResponse.redirect(targetUrl);
  }

  if (
    isAuthenticated &&
    (pathname.startsWith("/signup") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
