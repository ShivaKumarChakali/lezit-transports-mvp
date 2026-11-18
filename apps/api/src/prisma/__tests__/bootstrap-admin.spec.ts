import type { PrismaClient } from '@prisma/client';
import { ensureApprovedSuperAdmin } from '../bootstrap-admin';

function makePrisma() {
  const prisma = {
    user: { findFirst: jest.fn(), update: jest.fn() },
  } as unknown as PrismaClient;
  return { prisma, user: prisma.user as unknown as { findFirst: jest.Mock; update: jest.Mock } };
}

const pendingAdmin = {
  id: 'user-pending',
  email: 'demo@lezit.local',
  role: 'super_admin',
  approvalStatus: 'pending',
  status: 'active',
  createdAt: new Date('2026-11-18T00:00:00.000Z'),
};

const approvedAdmin = { ...pendingAdmin, id: 'user-approved', approvalStatus: 'approved' };

describe('ensureApprovedSuperAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('approves the oldest pending super_admin when none is approved', async () => {
    const { prisma, user } = makePrisma();
    user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(pendingAdmin);
    await expect(ensureApprovedSuperAdmin(prisma)).resolves.toBe('demo@lezit.local');
    expect(user.update).toHaveBeenCalledWith({
      where: { id: 'user-pending' },
      data: { approvalStatus: 'approved' },
    });
  });

  it('does nothing when an approved super_admin already exists', async () => {
    const { prisma, user } = makePrisma();
    user.findFirst.mockResolvedValueOnce(approvedAdmin);
    await expect(ensureApprovedSuperAdmin(prisma)).resolves.toBeNull();
    expect(user.findFirst).toHaveBeenCalledTimes(1);
    expect(user.update).not.toHaveBeenCalled();
  });

  it('does nothing when there is no super_admin at all', async () => {
    const { prisma, user } = makePrisma();
    user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    await expect(ensureApprovedSuperAdmin(prisma)).resolves.toBeNull();
    expect(user.update).not.toHaveBeenCalled();
  });
});
