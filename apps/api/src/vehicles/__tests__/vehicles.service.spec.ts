import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { VehiclesService } from '../vehicles.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeService() {
  const prisma = {
    vehicle: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
  return {
    service: new VehiclesService(prisma),
    prisma: prisma as unknown as { vehicle: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } },
  };
}

const ownVehicle = { id: 'veh-1', ownerId: 'owner-1', registrationNumber: 'TS01AB1234', approvalStatus: 'pending' };
const otherVehicle = { id: 'veh-2', ownerId: 'owner-2', registrationNumber: 'TS02CD5678', approvalStatus: 'approved' };

describe('VehiclesService ownership', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lets a vehicle owner fetch their own vehicle', async () => {
    const { service, prisma } = makeService();
    prisma.vehicle.findUnique.mockResolvedValue(ownVehicle);
    await expect(service.get('veh-1', 'owner-1', 'vehicle_owner')).resolves.toEqual(ownVehicle);
  });

  it('forbids a vehicle owner from fetching another owner’s vehicle', async () => {
    const { service, prisma } = makeService();
    prisma.vehicle.findUnique.mockResolvedValue(otherVehicle);
    await expect(service.get('veh-2', 'owner-1', 'vehicle_owner')).rejects.toThrow(ForbiddenException);
  });

  it('lets an admin fetch any vehicle', async () => {
    const { service, prisma } = makeService();
    prisma.vehicle.findUnique.mockResolvedValue(otherVehicle);
    await expect(service.get('veh-2', 'admin-1', 'super_admin')).resolves.toEqual(otherVehicle);
    await expect(service.get('veh-2', 'admin-1', 'lezit_admin')).resolves.toEqual(otherVehicle);
  });

  it('throws NotFound for a missing vehicle', async () => {
    const { service, prisma } = makeService();
    prisma.vehicle.findUnique.mockResolvedValue(null);
    await expect(service.get('missing', 'owner-1', 'vehicle_owner')).rejects.toThrow(NotFoundException);
  });

  it('scopes the vehicle list to the owner for vehicle_owner, and shows all for admins', async () => {
    const { service, prisma } = makeService();
    prisma.vehicle.findMany.mockResolvedValue([ownVehicle]);
    await service.list('owner-1', 'vehicle_owner');
    expect(prisma.vehicle.findMany).toHaveBeenCalledWith({ where: { ownerId: 'owner-1' }, orderBy: { createdAt: 'desc' } });
    await service.list('admin-1', 'super_admin');
    expect(prisma.vehicle.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { createdAt: 'desc' } });
  });

  it('approves a vehicle', async () => {
    const { service, prisma } = makeService();
    prisma.vehicle.findUnique.mockResolvedValue(ownVehicle);
    prisma.vehicle.update.mockResolvedValue({ ...ownVehicle, approvalStatus: 'approved' });
    await expect(service.setApproval('veh-1', 'approved')).resolves.toEqual({ ...ownVehicle, approvalStatus: 'approved' });
  });
});
