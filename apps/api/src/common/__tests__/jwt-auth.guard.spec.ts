import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../jwt-auth.guard';

function guardWith(token: string | undefined, verify: jest.Mock) {
  const jwt = { verify } as unknown as JwtService;
  const guard = new JwtAuthGuard(jwt);
  const req: { headers: Record<string, string>; user?: unknown } = { headers: {} };
  if (token) req.headers.authorization = `Bearer ${token}`;
  const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as never;
  return { guard, ctx, req };
}

describe('JwtAuthGuard', () => {
  it('accepts a valid bearer token and attaches the user to the request', () => {
    const payload = { sub: 'user-1', role: 'super_admin' };
    const { guard, ctx, req } = guardWith('valid-token', jest.fn().mockReturnValue(payload));
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual(payload);
  });

  it('rejects a request with no bearer token', () => {
    const { guard, ctx } = guardWith(undefined, jest.fn());
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects an invalid or expired token', () => {
    const { guard, ctx } = guardWith('bad-token', jest.fn().mockImplementation(() => {
      throw new Error('invalid token');
    }));
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
