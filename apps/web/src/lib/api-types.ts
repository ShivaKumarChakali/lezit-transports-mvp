import type { Role } from './roles';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ApiVehicle {
  id: string;
  ownerId: string;
  registrationNumber: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  seatCapacity?: number | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ApiDocument {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string | null;
  fileType?: string | null;
  documentKind?: string | null;
  verified: boolean;
  createdAt: string;
}

// Role-specific profile record, or null when none has been saved yet.
export type ApiProfile = Record<string, unknown> | null;
