import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/profile', '/settings', '/account'];

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('__Secure-next-auth.session-token') ||
    request.cookies.get('next-auth.session-token');

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/login');
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/account/:path*',
  ],
};
