import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from '../attendance.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeService() {
  const prisma = {
    trip: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    attendance: { upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
  } as unknown as PrismaService;
  return { service: new AttendanceService(prisma), prisma: prisma as unknown as Record<string, Record<string, jest.Mock>> };
}

const trip = { id: 'trip-1', driverId: 'drv-1' };
const passenger = { id: 'pass-1', role: 'passenger' };

describe('AttendanceService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('checks a passenger in for the assigned driver', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue(trip);
    prisma.user.findUnique.mockResolvedValue(passenger);
    prisma.attendance.upsert.mockResolvedValue({ id: 'att-1', status: 'checked_in' });
    await expect(service.checkIn('drv-1', 'driver', 'trip-1', 'pass-1', 'book-1')).resolves.toEqual({
      id: 'att-1',
      status: 'checked_in',
    });
  });

  it('forbids a different driver from checking passengers in', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue(trip);
    await expect(service.checkIn('drv-2', 'driver', 'trip-1', 'pass-1')).rejects.toThrow(ForbiddenException);
  });

  it('checks a passenger out after check-in', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue(trip);
    prisma.attendance.findUnique.mockResolvedValue({ id: 'att-1', status: 'checked_in' });
    prisma.attendance.update.mockResolvedValue({ id: 'att-1', status: 'checked_out' });
    await expect(service.checkOut('drv-1', 'driver', 'trip-1', 'pass-1')).resolves.toEqual({
      id: 'att-1',
      status: 'checked_out',
    });
  });

  it('refuses check-out with no check-in record', async () => {
    const { service, prisma } = makeService();
    prisma.trip.findUnique.mockResolvedValue(trip);
    prisma.attendance.findUnique.mockResolvedValue(null);
    await expect(service.checkOut('drv-1', 'driver', 'trip-1', 'pass-1')).rejects.toThrow(NotFoundException);
  });

  it('scopes the list to the passenger for a passenger', async () => {
    const { service, prisma } = makeService();
    prisma.attendance.findMany.mockResolvedValue([]);
    await service.list('pass-1', 'passenger');
    expect(prisma.attendance.findMany).toHaveBeenCalledWith({
      where: { passengerId: 'pass-1' },
      orderBy: { createdAt: 'desc' },
    });
  });
});
