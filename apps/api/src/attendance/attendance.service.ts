import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async tripFor(userId: string, role: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    const isAdmin = role === 'super_admin' || role === 'lezit_admin';
    if (!isAdmin && trip.driverId !== userId) {
      throw new ForbiddenException('Only the assigned driver (or an admin) records attendance for this trip');
    }
    return trip;
  }

  async checkIn(userId: string, role: string, tripId: string, passengerId: string, bookingId?: string) {
    await this.tripFor(userId, role, tripId);
    const passenger = await this.prisma.user.findUnique({ where: { id: passengerId } });
    if (!passenger || passenger.role !== 'passenger') {
      throw new NotFoundException('Passenger not found');
    }
    return this.prisma.attendance.upsert({
      where: { tripId_passengerId: { tripId, passengerId } },
      update: { status: 'checked_in', checkInAt: new Date(), checkOutAt: null },
      create: { tripId, passengerId, bookingId, status: 'checked_in', checkInAt: new Date() },
    });
  }

  async checkOut(userId: string, role: string, tripId: string, passengerId: string) {
    await this.tripFor(userId, role, tripId);
    const record = await this.prisma.attendance.findUnique({
      where: { tripId_passengerId: { tripId, passengerId } },
    });
    if (!record) throw new NotFoundException('No check-in record for this passenger on this trip');
    return this.prisma.attendance.update({
      where: { id: record.id },
      data: { status: 'checked_out', checkOutAt: new Date() },
    });
  }

  async list(userId: string, role: string, tripId?: string) {
    if (role === 'passenger') {
      return this.prisma.attendance.findMany({
        where: { passengerId: userId, ...(tripId ? { tripId } : {}) },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (tripId) {
      // A driver may only see attendance for their own trips.
      await this.tripFor(userId, role, tripId);
    }
    return this.prisma.attendance.findMany({
      where: tripId ? { tripId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}
