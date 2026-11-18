import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const select = { id: true, email: true, name: true, phone: true, role: true, approvalStatus: true, status: true, createdAt: true };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({ select, orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setApproval(id: string, approvalStatus: ApprovalStatus) {
    await this.get(id);
    return this.prisma.user.update({ where: { id }, data: { approvalStatus }, select });
  }
}
