import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTripDto {
  routeId: string;
  scheduleId?: string;
  vehicleId?: string;
  driverId?: string;
  date: string;
}

// Trip dates are calendar dates, not instants: a bare date ("2026-11-18")
// parsed as midnight UTC shifts a day earlier when rendered in the
// Americas. Store bare dates at noon UTC so the calendar date survives in
// every timezone; full timestamps pass through unchanged.
function parseTripDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00.000Z`);
  return new Date(value);
}

// Vehicle details shown with a trip (e.g. the driver dashboard's assigned
// vehicle), so the frontend does not need a separate lookup.
const vehicleInclude = {
  vehicle: { select: { registrationNumber: true, make: true, model: true } },
};

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } });
    if (!route) throw new NotFoundException('Route not found');
    if (dto.scheduleId) {
      const schedule = await this.prisma.schedule.findUnique({ where: { id: dto.scheduleId } });
      if (!schedule) throw new NotFoundException('Schedule not found');
    }
    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
      if (!vehicle) throw new NotFoundException('Vehicle not found');
    }
    if (dto.driverId) {
      const driver = await this.prisma.user.findUnique({ where: { id: dto.driverId } });
      if (!driver || driver.role !== 'driver') throw new NotFoundException('Driver not found');
    }
    return this.prisma.trip.create({ data: { ...dto, date: parseTripDate(dto.date) } });
  }

  async list(userId: string, role: string) {
    if (role === 'driver') {
      return this.prisma.trip.findMany({
        where: { driverId: userId },
        orderBy: { date: 'desc' },
        include: vehicleInclude,
      });
    }
    if (role === 'vehicle_owner') {
      const vehicles = await this.prisma.vehicle.findMany({ where: { ownerId: userId }, select: { id: true } });
      return this.prisma.trip.findMany({
        where: { vehicleId: { in: vehicles.map((v) => v.id) } },
        orderBy: { date: 'desc' },
        include: vehicleInclude,
      });
    }
    return this.prisma.trip.findMany({ orderBy: { date: 'desc' }, include: vehicleInclude });
  }

  async get(id: string, userId: string, role: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (role === 'driver' && trip.driverId !== userId) {
      throw new ForbiddenException('This trip is not assigned to you');
    }
    if (role === 'vehicle_owner' && trip.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
      if (!vehicle || vehicle.ownerId !== userId) {
        throw new ForbiddenException('This trip does not use your vehicle');
      }
    }
    return trip;
  }

  // Passengers booked on this trip (via its schedule, or its route when
  // there is no schedule): the list a driver checks in from.
  async getBookings(id: string, userId: string, role: string) {
    const trip = await this.get(id, userId, role);
    if (trip.scheduleId) {
      return this.prisma.booking.findMany({
        where: { scheduleId: trip.scheduleId, status: { in: ['pending', 'confirmed'] } },
        orderBy: { createdAt: 'asc' },
      });
    }
    return this.prisma.booking.findMany({
      where: { routeId: trip.routeId, status: { in: ['pending', 'confirmed'] } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async start(id: string, userId: string, role: string) {
    const trip = await this.get(id, userId, role);
    if (trip.status !== 'scheduled') {
      throw new ConflictException(`Trip cannot be started from status ${trip.status}`);
    }
    return this.prisma.trip.update({
      where: { id },
      data: { status: 'in_progress', startedAt: new Date() },
    });
  }

  async complete(id: string, userId: string, role: string) {
    const trip = await this.get(id, userId, role);
    if (trip.status !== 'in_progress') {
      throw new ConflictException(`Trip cannot be completed from status ${trip.status}`);
    }
    const completed = await this.prisma.trip.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
    // Confirmed bookings on this trip's schedule/route are done too.
    const where = trip.scheduleId
      ? { scheduleId: trip.scheduleId, status: 'confirmed' as const }
      : { routeId: trip.routeId, status: 'confirmed' as const };
    await this.prisma.booking.updateMany({ where, data: { status: 'completed' } });
    return completed;
  }
}
