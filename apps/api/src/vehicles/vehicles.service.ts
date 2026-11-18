import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, role: string) {
    const where = role === 'vehicle_owner' ? { ownerId: userId } : {};
    return this.prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  create(ownerId: string, dto: { registrationNumber: string; make?: string; model?: string; year?: number; seatCapacity?: number }) {
    return this.prisma.vehicle.create({ data: { ownerId, ...dto } });
  }

  async get(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
}
