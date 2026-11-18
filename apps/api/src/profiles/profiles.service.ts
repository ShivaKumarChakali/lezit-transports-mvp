import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateProfileDto {
  businessName?: string;
  gstNumber?: string;
  address?: string;
  licenceNumber?: string;
  licenceExpiry?: string;
  orgName?: string;
  contactPerson?: string;
  employeeId?: string;
  orgId?: string;
}

// Role-specific profile records (Phase 1): owner business details, driver
// licence, organization details, passenger details. Admins have no profile.
@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string, role: string) {
    return { role, profile: await this.findProfile(userId, role) };
  }

  async getByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { role: user.role, profile: await this.findProfile(userId, user.role) };
  }

  async updateMe(userId: string, role: string, dto: UpdateProfileDto) {
    switch (role) {
      case 'vehicle_owner':
        return this.prisma.vehicleOwnerProfile.upsert({
          where: { userId },
          update: {
            businessName: dto.businessName ?? '',
            gstNumber: dto.gstNumber,
            address: dto.address,
          },
          create: {
            userId,
            businessName: dto.businessName ?? '',
            gstNumber: dto.gstNumber,
            address: dto.address,
          },
        });
      case 'driver':
        return this.prisma.driverProfile.upsert({
          where: { userId },
          update: {
            licenceNumber: dto.licenceNumber ?? '',
            licenceExpiry: dto.licenceExpiry ? new Date(dto.licenceExpiry) : undefined,
          },
          create: {
            userId,
            licenceNumber: dto.licenceNumber ?? '',
            licenceExpiry: dto.licenceExpiry ? new Date(dto.licenceExpiry) : undefined,
          },
        });
      case 'organization':
        return this.prisma.organizationProfile.upsert({
          where: { userId },
          update: {
            orgName: dto.orgName ?? '',
            contactPerson: dto.contactPerson,
            address: dto.address,
          },
          create: {
            userId,
            orgName: dto.orgName ?? '',
            contactPerson: dto.contactPerson,
            address: dto.address,
          },
        });
      case 'passenger':
        return this.prisma.passengerProfile.upsert({
          where: { userId },
          update: { employeeId: dto.employeeId, orgId: dto.orgId },
          create: { userId, employeeId: dto.employeeId, orgId: dto.orgId },
        });
      default:
        return null;
    }
  }

  private findProfile(userId: string, role: string) {
    switch (role) {
      case 'vehicle_owner':
        return this.prisma.vehicleOwnerProfile.findUnique({ where: { userId } });
      case 'driver':
        return this.prisma.driverProfile.findUnique({ where: { userId } });
      case 'organization':
        return this.prisma.organizationProfile.findUnique({ where: { userId } });
      case 'passenger':
        return this.prisma.passengerProfile.findUnique({ where: { userId } });
      default:
        return Promise.resolve(null);
    }
  }
}
