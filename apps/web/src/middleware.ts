import { NextRequest, NextResponse } from 'next/server';
import { DASHBOARD_ROLES, ROLE_DASHBOARDS, decodeJwtPayload } from './lib/roles';

// Protect every /dashboard/* route. The API verifies the JWT signature; here
// we decode the payload (no secret needed) to enforce the *role* as well:
// a user visiting another role's dashboard is sent to their own dashboard,
// and a missing / malformed / expired token goes to /login.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/dashboard')) return NextResponse.next();

  const token = req.cookies.get('lezit_token')?.value;
  const login = () => {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set('lezit_token', '', { path: '/', maxAge: 0 });
    return res;
  };
  if (!token) return login();

  const payload = decodeJwtPayload(token);
  if (!payload?.role || !ROLE_DASHBOARDS[payload.role]) return login();
  if (payload.exp && payload.exp * 1000 < Date.now()) return login();

  const segment = pathname.split('/')[2] ?? '';
  if (!segment) return NextResponse.redirect(new URL(ROLE_DASHBOARDS[payload.role], req.url));
  const expectedRole = DASHBOARD_ROLES[segment];
  if (expectedRole && expectedRole !== payload.role) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[payload.role], req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
