import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateBookingDto {
  passengerId: string;
  routeId: string;
  scheduleId?: string;
  seats?: number;
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createdById: string, dto: CreateBookingDto) {
    const passenger = await this.prisma.user.findUnique({ where: { id: dto.passengerId } });
    if (!passenger || passenger.role !== 'passenger') {
      throw new NotFoundException('Passenger not found');
    }
    const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } });
    if (!route) throw new NotFoundException('Route not found');

    let schedule: { id: string; routeId: string; vehicleId: string | null } | null = null;
    if (dto.scheduleId) {
      schedule = await this.prisma.schedule.findUnique({ where: { id: dto.scheduleId } });
      if (!schedule) throw new NotFoundException('Schedule not found');
      if (schedule.routeId !== dto.routeId) {
        throw new ConflictException('Schedule does not belong to this route');
      }
    }

    const seats = dto.seats ?? 1;
    if (schedule?.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: schedule.vehicleId } });
      if (vehicle?.seatCapacity != null) {
        const used = await this.prisma.booking.aggregate({
          where: { scheduleId: schedule.id, status: { in: ['pending', 'confirmed'] } },
          _sum: { seats: true },
        });
        const booked = used._sum.seats ?? 0;
        if (booked + seats > vehicle.seatCapacity) {
          throw new ConflictException(
            `Not enough seats: ${booked} of ${vehicle.seatCapacity} already booked on this schedule`,
          );
        }
      }
    }

    return this.prisma.booking.create({
      data: { passengerId: dto.passengerId, routeId: dto.routeId, scheduleId: dto.scheduleId, seats, createdById },
    });
  }

  list(userId: string, role: string) {
    // Admins see all bookings; passengers see only their own.
    const where = role === 'super_admin' || role === 'lezit_admin' ? {} : { passengerId: userId };
    return this.prisma.booking.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async get(id: string, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    const isAdmin = role === 'super_admin' || role === 'lezit_admin';
    if (!isAdmin && booking.passengerId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }
    return booking;
  }

  async setStatus(id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.prisma.booking.update({ where: { id }, data: { status } });
  }
}
