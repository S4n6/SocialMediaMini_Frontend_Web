import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production',
);

/**
 * Verify an access token cryptographically.
 * Returns true only when the signature and expiry are valid.
 */
async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const publicPaths = [
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  const isPublicPath = publicPaths.some((path) =>
    path === '/' ? pathname === '/' : pathname.includes(path),
  );

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Verify the JWT cryptographically — not just its existence
  const isAuthenticated = accessToken
    ? await verifyAccessToken(accessToken)
    : false;

  // If the access token is expired/invalid but a refresh token exists,
  // let the client-side Axios interceptor handle the refresh silently.
  const hasRefreshFallback = !isAuthenticated && Boolean(refreshToken);

  if (!isAuthenticated && !hasRefreshFallback && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);

    if (pathname !== '/' && pathname !== '/login') {
      loginUrl.searchParams.set('redirect', pathname + search);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname.startsWith('/login')) {
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    const targetUrl = new URL(redirectTo || '/', request.url);
    return NextResponse.redirect(targetUrl);
  }

  if (
    isAuthenticated &&
    (pathname.startsWith('/signup') || pathname.startsWith('/register'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
