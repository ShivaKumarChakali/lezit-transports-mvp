import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function makeService() {
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
  } as unknown as PrismaService;
  const jwt = { sign: jest.fn().mockReturnValue('test-jwt-token') } as unknown as JwtService;
  return { service: new AuthService(prisma, jwt), prisma: prisma as unknown as { user: { findUnique: jest.Mock; create: jest.Mock } }, jwt };
}

const baseUser = {
  id: 'user-1',
  email: 'admin@lezit.example',
  name: 'Admin',
  phone: null,
  role: 'super_admin',
  approvalStatus: 'pending',
  status: 'active',
  createdAt: new Date('2026-11-18T00:00:00.000Z'),
};

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registers a new user with a bcrypt-hashed password and returns a JWT', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(null);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    prisma.user.create.mockResolvedValue({ ...baseUser, passwordHash: 'hashed-password' });

    const result = await service.register({
      email: 'admin@lezit.example',
      password: 'password123',
      name: 'Admin',
      role: 'super_admin',
    });

    expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(result.accessToken).toBe('test-jwt-token');
    expect(result.user.email).toBe('admin@lezit.example');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects registration when the email already exists', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(baseUser);
    await expect(
      service.register({ email: 'admin@lezit.example', password: 'password123', name: 'Admin', role: 'driver' }),
    ).rejects.toThrow(ConflictException);
  });

  it('logs in with correct credentials and returns a JWT', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'hashed-password' });
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({ email: 'admin@lezit.example', password: 'password123' });
    expect(result.accessToken).toBe('test-jwt-token');
    expect(result.user.role).toBe('super_admin');
  });

  it('rejects login with a wrong password', async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'hashed-password' });
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'admin@lezit.example', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
