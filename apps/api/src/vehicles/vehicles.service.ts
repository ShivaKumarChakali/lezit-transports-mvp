import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
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

  async setApproval(id: string, approvalStatus: ApprovalStatus) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.prisma.vehicle.update({ where: { id }, data: { approvalStatus } });
  }

  async get(id: string, userId: string, role: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    // A vehicle owner may only fetch their own vehicles; admins may fetch any.
    if (role === 'vehicle_owner' && vehicle.ownerId !== userId) {
      throw new ForbiddenException('You can only view your own vehicles');
    }
    return vehicle;
  }
}
