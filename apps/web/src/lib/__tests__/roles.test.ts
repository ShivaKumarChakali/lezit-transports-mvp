import { describe, expect, it } from 'vitest';
import { ALL_ROLES, DASHBOARD_ROLES, PUBLIC_ROLES, ROLE_DASHBOARDS, ROLE_LABELS, decodeJwtPayload } from '../roles';

describe('roles', () => {
  it('has exactly the six roles from the quote', () => {
    expect(ALL_ROLES).toEqual([
      'super_admin',
      'lezit_admin',
      'vehicle_owner',
      'driver',
      'organization',
      'passenger',
    ]);
  });

  it('maps every role to its own dashboard', () => {
    expect(ROLE_DASHBOARDS).toEqual({
      super_admin: '/dashboard/super-admin',
      lezit_admin: '/dashboard/admin',
      vehicle_owner: '/dashboard/owner',
      driver: '/dashboard/driver',
      organization: '/dashboard/organization',
      passenger: '/dashboard/passenger',
    });
  });

  it('labels every role', () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
    }
    expect(ROLE_LABELS.super_admin).toBe('Super Admin');
    expect(ROLE_LABELS.vehicle_owner).toBe('Vehicle Owner');
  });

  it('allows public self-registration only for non-admin roles', () => {
    expect(PUBLIC_ROLES).toEqual(['vehicle_owner', 'driver', 'organization', 'passenger']);
    expect(PUBLIC_ROLES).not.toContain('super_admin');
    expect(PUBLIC_ROLES).not.toContain('lezit_admin');
  });

  it('maps every dashboard URL segment to its owning role', () => {
    expect(DASHBOARD_ROLES).toEqual({
      'super-admin': 'super_admin',
      admin: 'lezit_admin',
      owner: 'vehicle_owner',
      driver: 'driver',
      organization: 'organization',
      passenger: 'passenger',
    });
  });

  it('decodes the role from a JWT payload without verifying it', () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'u1', role: 'driver', exp: 9999999999 }))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodeJwtPayload(`header.${payload}.signature`)).toEqual({ sub: 'u1', role: 'driver', exp: 9999999999 });
    expect(decodeJwtPayload('not-a-token')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
  });
});
