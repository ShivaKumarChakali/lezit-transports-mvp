import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateScheduleDto {
  routeId: string;
  vehicleId?: string;
  driverId?: string;
  departureTime: string;
  days?: string[];
}

export interface UpdateScheduleDto {
  vehicleId?: string | null;
  driverId?: string | null;
  departureTime?: string;
  days?: string[];
  active?: boolean;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto) {
    const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } });
    if (!route) throw new NotFoundException('Route not found');
    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
      if (!vehicle) throw new NotFoundException('Vehicle not found');
    }
    if (dto.driverId) {
      const driver = await this.prisma.user.findUnique({ where: { id: dto.driverId } });
      if (!driver || driver.role !== 'driver') throw new NotFoundException('Driver not found');
    }
    return this.prisma.schedule.create({ data: dto });
  }

  async list(userId: string, role: string, routeId?: string) {
    if (role === 'vehicle_owner') {
      const vehicles = await this.prisma.vehicle.findMany({ where: { ownerId: userId }, select: { id: true } });
      return this.prisma.schedule.findMany({
        where: { vehicleId: { in: vehicles.map((v) => v.id) }, ...(routeId ? { routeId } : {}) },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (role === 'driver') {
      return this.prisma.schedule.findMany({
        where: { driverId: userId, ...(routeId ? { routeId } : {}) },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.schedule.findMany({
      where: routeId ? { routeId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string, userId: string, role: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (role === 'driver' && schedule.driverId !== userId) {
      throw new ForbiddenException('This schedule is not assigned to you');
    }
    if (role === 'vehicle_owner' && schedule.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: schedule.vehicleId } });
      if (!vehicle || vehicle.ownerId !== userId) {
        throw new ForbiddenException('This schedule does not use your vehicle');
      }
    }
    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto) {
    await this.prisma.schedule.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Schedule not found');
    });
    return this.prisma.schedule.update({ where: { id }, data: dto });
  }
}
