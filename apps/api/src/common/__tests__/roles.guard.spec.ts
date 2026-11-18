import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';

function contextWith(role: string | undefined, requiredRoles: string[] | undefined) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);
  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
  } as never;
  return { guard, ctx };
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const { guard, ctx } = contextWith('driver', undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when the user role matches a required role', () => {
    const { guard, ctx } = contextWith('lezit_admin', ['super_admin', 'lezit_admin']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('forbids access when the user role does not match', () => {
    const { guard, ctx } = contextWith('driver', ['super_admin', 'lezit_admin']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('forbids access when there is no authenticated user', () => {
    const { guard, ctx } = contextWith(undefined, ['super_admin']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
