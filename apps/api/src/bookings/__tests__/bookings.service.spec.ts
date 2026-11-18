import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeService() {
  const prisma = {
    user: { findUnique: jest.fn() },
    route: { findUnique: jest.fn() },
    schedule: { findUnique: jest.fn() },
    vehicle: { findUnique: jest.fn() },
    booking: { aggregate: jest.fn(), create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
  return { service: new BookingsService(prisma), prisma: prisma as unknown as Record<string, Record<string, jest.Mock>> };
}

const passenger = { id: 'pass-1', role: 'passenger' };
const route = { id: 'route-1' };
const schedule = { id: 'sch-1', routeId: 'route-1', vehicleId: 'veh-1' };
const vehicle = { id: 'veh-1', seatCapacity: 2 };

describe('BookingsService seat capacity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a booking when seats are available', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(passenger);
    prisma.route.findUnique.mockResolvedValue(route);
    prisma.schedule.findUnique.mockResolvedValue(schedule);
    prisma.vehicle.findUnique.mockResolvedValue(vehicle);
    prisma.booking.aggregate.mockResolvedValue({ _sum: { seats: 1 } });
    prisma.booking.create.mockResolvedValue({ id: 'book-1', seats: 1 });
    await expect(
      service.create('admin-1', { passengerId: 'pass-1', routeId: 'route-1', scheduleId: 'sch-1', seats: 1 }),
    ).resolves.toEqual({ id: 'book-1', seats: 1 });
  });

  it('rejects a booking that would exceed seat capacity', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(passenger);
    prisma.route.findUnique.mockResolvedValue(route);
    prisma.schedule.findUnique.mockResolvedValue(schedule);
    prisma.vehicle.findUnique.mockResolvedValue(vehicle);
    prisma.booking.aggregate.mockResolvedValue({ _sum: { seats: 2 } });
    await expect(
      service.create('admin-1', { passengerId: 'pass-1', routeId: 'route-1', scheduleId: 'sch-1', seats: 1 }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('rejects a booking for a non-passenger user', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue({ id: 'drv-1', role: 'driver' });
    await expect(
      service.create('admin-1', { passengerId: 'drv-1', routeId: 'route-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects a schedule from another route', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(passenger);
    prisma.route.findUnique.mockResolvedValue(route);
    prisma.schedule.findUnique.mockResolvedValue({ ...schedule, routeId: 'route-2' });
    await expect(
      service.create('admin-1', { passengerId: 'pass-1', routeId: 'route-1', scheduleId: 'sch-1' }),
    ).rejects.toThrow(ConflictException);
  });
});
