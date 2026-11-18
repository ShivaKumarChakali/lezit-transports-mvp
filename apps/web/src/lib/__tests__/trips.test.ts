import { describe, expect, it } from 'vitest';
import { assignedVehicleFromTrips, vehicleLabel } from '../trips';
import type { ApiTrip } from '../api-types';

function trip(id: string, status: ApiTrip['status'], vehicle?: ApiTrip['vehicle']): ApiTrip {
  return {
    id,
    routeId: 'route-1',
    vehicleId: vehicle ? 'veh-1' : null,
    vehicle: vehicle ?? null,
    driverId: 'drv-1',
    date: '2026-11-18T12:00:00.000Z',
    status,
  };
}

const testBus = { registrationNumber: 'TEST-001', make: 'Smoke Test Bus', model: 'Test' };
const otherBus = { registrationNumber: 'TEST-002', make: 'Other', model: 'Bus' };

describe('assignedVehicleFromTrips', () => {
  it('prefers the vehicle of an in-progress trip', () => {
    const trips = [
      trip('t1', 'scheduled', otherBus),
      trip('t2', 'in_progress', testBus),
    ];
    expect(assignedVehicleFromTrips(trips)).toEqual(testBus);
  });

  it('falls back to a scheduled trip when nothing is in progress', () => {
    expect(assignedVehicleFromTrips([trip('t1', 'scheduled', testBus)])).toEqual(testBus);
  });

  it('returns null when the driver has no trips with a vehicle', () => {
    expect(assignedVehicleFromTrips([trip('t1', 'scheduled')])).toBeNull();
    expect(assignedVehicleFromTrips([])).toBeNull();
  });
});

describe('vehicleLabel', () => {
  it('shows registration with make and model', () => {
    expect(vehicleLabel(testBus)).toBe('TEST-001 · Smoke Test Bus Test');
  });

  it('shows registration alone when there is no make', () => {
    expect(vehicleLabel({ registrationNumber: 'TEST-003' })).toBe('TEST-003');
  });
});
