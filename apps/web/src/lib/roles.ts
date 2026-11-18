export type Role =
  | 'super_admin'
  | 'lezit_admin'
  | 'vehicle_owner'
  | 'driver'
  | 'organization'
  | 'passenger';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  lezit_admin: 'LEZIT Admin',
  vehicle_owner: 'Vehicle Owner',
  driver: 'Driver',
  organization: 'Organization',
  passenger: 'Passenger',
};

export const ROLE_DASHBOARDS: Record<Role, string> = {
  super_admin: '/dashboard/super-admin',
  lezit_admin: '/dashboard/admin',
  vehicle_owner: '/dashboard/owner',
  driver: '/dashboard/driver',
  organization: '/dashboard/organization',
  passenger: '/dashboard/passenger',
};

export const ALL_ROLES: Role[] = [
  'super_admin',
  'lezit_admin',
  'vehicle_owner',
  'driver',
  'organization',
  'passenger',
];

// Roles that may self-register through the public register page. Admin roles
// are created only by an existing admin or the seed script — never here.
export const PUBLIC_ROLES: Role[] = ['vehicle_owner', 'driver', 'organization', 'passenger'];

// Dashboard URL segment -> role that owns that dashboard.
export const DASHBOARD_ROLES: Record<string, Role> = {
  'super-admin': 'super_admin',
  admin: 'lezit_admin',
  owner: 'vehicle_owner',
  driver: 'driver',
  organization: 'organization',
  passenger: 'passenger',
};

// Decode a JWT payload without verifying its signature (the API verifies it).
// Used only for routing in middleware / the dashboard guard; the API remains
// the source of truth for authorisation. Returns null for malformed tokens.
export function decodeJwtPayload(token: string): { role?: Role; exp?: number } | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as { role?: Role; exp?: number };
  } catch {
    return null;
  }
}
