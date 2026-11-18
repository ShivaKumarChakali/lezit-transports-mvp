import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hashed-password') }));

function makeService() {
  const prisma = {
    user: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
  return {
    service: new UsersService(prisma),
    prisma: prisma as unknown as { user: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } },
  };
}

const userRow = {
  id: 'user-1',
  email: 'owner@lezit.example',
  name: 'Owner',
  phone: null,
  role: 'vehicle_owner',
  approvalStatus: 'pending',
  status: 'active',
  createdAt: new Date('2026-11-18T00:00:00.000Z'),
};

describe('UsersService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets approval status', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(userRow);
    prisma.user.update.mockResolvedValue({ ...userRow, approvalStatus: 'approved' });
    await expect(service.setApproval('user-1', 'approved')).resolves.toMatchObject({ approvalStatus: 'approved' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { approvalStatus: 'approved' },
      select: expect.anything(),
    });
  });

  it('deactivates and reactivates an account', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(userRow);
    prisma.user.update.mockResolvedValue({ ...userRow, status: 'inactive' });
    await expect(service.setStatus('user-1', 'inactive')).resolves.toMatchObject({ status: 'inactive' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { status: 'inactive' },
      select: expect.anything(),
    });
  });

  it('creates an admin account as approved and active', async () => {
    const { service, prisma } = makeService();
    prisma.user.create.mockResolvedValue({ ...userRow, role: 'lezit_admin', approvalStatus: 'approved' });
    const created = await service.createAdmin({
      email: 'admin@lezit.example',
      password: 'password123',
      name: 'Admin',
      role: 'lezit_admin',
    });
    expect(created.approvalStatus).toBe('approved');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: 'lezit_admin', approvalStatus: 'approved', status: 'active' }),
      select: expect.anything(),
    });
  });
});
