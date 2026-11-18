import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, ApprovalStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

  async setStatus(id: string, status: AccountStatus) {
    await this.get(id);
    return this.prisma.user.update({ where: { id }, data: { status }, select });
  }

  // Admin accounts are created only by an existing super_admin (or the seed
  // script), never by public self-registration. They start approved + active.
  async createAdmin(dto: { email: string; password: string; name: string; phone?: string; role: Role }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        role: dto.role,
        approvalStatus: 'approved',
        status: 'active',
      },
      select,
    });
  }
}
