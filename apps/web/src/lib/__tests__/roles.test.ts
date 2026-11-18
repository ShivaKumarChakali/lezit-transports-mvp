import { describe, expect, it } from 'vitest';
import { ALL_ROLES, ROLE_DASHBOARDS, ROLE_LABELS } from '../roles';

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
});
