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

export interface ApiRoute {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: string[];
  createdAt: string;
}

export interface ApiSchedule {
  id: string;
  routeId: string;
  vehicleId?: string | null;
  driverId?: string | null;
  departureTime: string;
  days: string[];
  active: boolean;
}

export interface ApiBooking {
  id: string;
  passengerId: string;
  routeId: string;
  scheduleId?: string | null;
  seats: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface ApiTrip {
  id: string;
  routeId: string;
  scheduleId?: string | null;
  vehicleId?: string | null;
  // Vehicle details included with the trip (see TripsService.list), so the
  // driver dashboard can show the assigned vehicle without another lookup.
  vehicle?: { registrationNumber: string; make?: string | null; model?: string | null } | null;
  driverId?: string | null;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ApiAttendance {
  id: string;
  tripId: string;
  bookingId?: string | null;
  passengerId: string;
  status: 'checked_in' | 'checked_out' | 'absent';
  checkInAt: string;
  checkOutAt?: string | null;
}
