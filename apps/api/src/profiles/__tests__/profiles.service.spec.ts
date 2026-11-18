import { ProfilesService } from '../profiles.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeService() {
  const prisma = {
    user: { findUnique: jest.fn() },
    vehicleOwnerProfile: { findUnique: jest.fn(), upsert: jest.fn() },
    driverProfile: { findUnique: jest.fn(), upsert: jest.fn() },
    organizationProfile: { findUnique: jest.fn(), upsert: jest.fn() },
    passengerProfile: { findUnique: jest.fn(), upsert: jest.fn() },
  } as unknown as PrismaService;
  return { service: new ProfilesService(prisma), prisma: prisma as unknown as Record<string, Record<string, jest.Mock>> };
}

describe('ProfilesService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the driver profile for a driver', async () => {
    const { service, prisma } = makeService();
    const profile = { userId: 'driver-1', licenceNumber: 'DL123', licenceExpiry: new Date('2030-01-01') };
    prisma.driverProfile.findUnique.mockResolvedValue(profile);
    await expect(service.getMe('driver-1', 'driver')).resolves.toEqual({ role: 'driver', profile });
  });

  it('returns null profile for an admin (admins have no profile)', async () => {
    const { service } = makeService();
    await expect(service.getMe('admin-1', 'super_admin')).resolves.toEqual({ role: 'super_admin', profile: null });
  });

  it('upserts the owner profile', async () => {
    const { service, prisma } = makeService();
    const profile = { userId: 'owner-1', businessName: 'Sharma Transports' };
    prisma.vehicleOwnerProfile.upsert.mockResolvedValue(profile);
    await expect(
      service.updateMe('owner-1', 'vehicle_owner', { businessName: 'Sharma Transports' }),
    ).resolves.toEqual(profile);
    expect(prisma.vehicleOwnerProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'owner-1' } }),
    );
  });

  it('upserts the driver licence, parsing the expiry date', async () => {
    const { service, prisma } = makeService();
    prisma.driverProfile.upsert.mockResolvedValue({ userId: 'driver-1', licenceNumber: 'DL123' });
    await service.updateMe('driver-1', 'driver', { licenceNumber: 'DL123', licenceExpiry: '2030-01-01' });
    const call = prisma.driverProfile.upsert.mock.calls[0][0] as { create: { licenceExpiry?: Date } };
    expect(call.create.licenceExpiry).toEqual(new Date('2030-01-01'));
  });
});
