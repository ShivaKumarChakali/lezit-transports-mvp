import type { ApiTrip } from './api-types';

export interface AssignedVehicle {
  registrationNumber: string;
  make?: string | null;
  model?: string | null;
}

export function vehicleLabel(v: AssignedVehicle): string {
  const name = [v.make, v.model].filter(Boolean).join(' ').trim();
  return name ? `${v.registrationNumber} · ${name}` : v.registrationNumber;
}

// A driver's assigned vehicle is derived from their trips — no separate
// vehicle-assignment feature exists. Prefer the vehicle of an in-progress
// trip, then the next scheduled trip, then any trip with a vehicle.
export function assignedVehicleFromTrips(trips: ApiTrip[]): AssignedVehicle | null {
  const withVehicle = trips.filter((t) => t.vehicle);
  const pick =
    withVehicle.find((t) => t.status === 'in_progress') ??
    withVehicle.find((t) => t.status === 'scheduled') ??
    withVehicle[0];
  return pick?.vehicle ?? null;
}
