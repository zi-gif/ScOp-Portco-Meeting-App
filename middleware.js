import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow auth API and login page without auth
  if (pathname === '/api/auth' || pathname === '/login') {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('scop_auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    // If no APP_PASSWORD env is set, skip auth (dev mode)
    if (!process.env.APP_PASSWORD) {
      return NextResponse.next();
    }

    // Redirect to login for pages, return 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
