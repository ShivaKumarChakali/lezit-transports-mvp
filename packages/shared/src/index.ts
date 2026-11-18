export type Role =
  | 'super_admin'
  | 'lezit_admin'
  | 'vehicle_owner'
  | 'driver'
  | 'organization'
  | 'passenger';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AccountStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  approvalStatus: ApprovalStatus;
  status: AccountStatus;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

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
