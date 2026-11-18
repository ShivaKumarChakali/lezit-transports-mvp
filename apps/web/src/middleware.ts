import { NextRequest, NextResponse } from 'next/server';

// Phase 1: protect every /dashboard/* route. A valid JWT is checked by the API;
// here we only require the token cookie to exist, so an unauthenticated
// visitor is sent to /login instead of seeing a dashboard shell.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('lezit_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
