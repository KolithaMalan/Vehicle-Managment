import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public API routes
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout'
  ];

  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Public pages
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api') || pathname.startsWith('/map')) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/login',
    '/',
    '/map'
  ]
};