import { ConflictException, ForbiddenException } from '@nestjs/common';
import { TripsService } from '../trips.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeService() {
  const prisma = {
    route: { findUnique: jest.fn() },
    schedule: { findUnique: jest.fn() },
    vehicle: { findUnique: jest.fn(), findMany: jest.fn() },
    user: { findUnique: jest.fn() },
    trip: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    booking: { findMany: jest.fn(), updateMany: jest.fn() },
  } as unknown as PrismaService;
  return { service: new TripsService(prisma), prisma: prisma as unknown as Record<string, Record<string, jest.Mock>> };
}

const trip = {
  id: 'trip-1',
  routeId: 'route-1',
  scheduleId: 'sch-1',
  vehicleId: 'veh-1',
  driverId: 'drv-1',
  date: new Date('2026-11-20T08:00:00.000Z'),
  status: 'scheduled',
};

describe('TripsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts a scheduled trip for its assigned driver', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue(trip);
    prisma.trip.update.mockResolvedValue({ ...trip, status: 'in_progress' });
    await expect(service.start('trip-1', 'drv-1', 'driver')).resolves.toMatchObject({ status: 'in_progress' });
  });

  it('forbids another driver from starting the trip', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue(trip);
    await expect(service.start('trip-1', 'drv-2', 'driver')).rejects.toThrow(ForbiddenException);
  });

  it('refuses to start a trip that is not scheduled', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue({ ...trip, status: 'completed' });
    await expect(service.start('trip-1', 'drv-1', 'driver')).rejects.toThrow(ConflictException);
  });

  it('completes an in-progress trip and marks its bookings completed', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue({ ...trip, status: 'in_progress' });
    prisma.trip.update.mockResolvedValue({ ...trip, status: 'completed' });
    prisma.booking.updateMany.mockResolvedValue({ count: 2 });
    await expect(service.complete('trip-1', 'drv-1', 'driver')).resolves.toMatchObject({ status: 'completed' });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { scheduleId: 'sch-1', status: 'confirmed' },
      data: { status: 'completed' },
    });
  });

  it('lists only the assigned driver’s trips for a driver, with vehicle details', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findMany.mockResolvedValue([trip]);
    await service.list('drv-1', 'driver');
    expect(prisma.trip.findMany).toHaveBeenCalledWith({
      where: { driverId: 'drv-1' },
      orderBy: { date: 'desc' },
      include: { vehicle: { select: { registrationNumber: true, make: true, model: true } } },
    });
  });

  it('stores a bare calendar date at noon UTC so it cannot shift a day', async () => {
    const { service, prisma } = makeService();
    prisma.route.findUnique.mockResolvedValue({ id: 'route-1' });
    prisma.trip.create.mockResolvedValue(trip);
    await service.create({ routeId: 'route-1', date: '2026-11-18' });
    expect(prisma.trip.create).toHaveBeenCalledWith({
      data: { routeId: 'route-1', date: new Date('2026-11-18T12:00:00.000Z') },
    });
  });

  it('passes a full timestamp through unchanged', async () => {
    const { service, prisma } = makeService();
    prisma.route.findUnique.mockResolvedValue({ id: 'route-1' });
    prisma.trip.create.mockResolvedValue(trip);
    await service.create({ routeId: 'route-1', date: '2026-11-18T08:00:00.000Z' });
    expect(prisma.trip.create).toHaveBeenCalledWith({
      data: { routeId: 'route-1', date: new Date('2026-11-18T08:00:00.000Z') },
    });
  });
});
