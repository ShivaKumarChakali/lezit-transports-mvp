import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';

const publicUser = (u: { id: string; email: string; name: string; phone: string | null; role: string; approvalStatus: string; status: string; createdAt: Date }) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  phone: u.phone,
  role: u.role,
  approvalStatus: u.approvalStatus,
  status: u.status,
  createdAt: u.createdAt.toISOString(),
});

// Roles that may self-register through the public /auth/register endpoint.
// Admin roles are never self-registered: admin accounts are created only by
// an existing admin (POST /users, super_admin only) or by the seed script.
export const PUBLIC_REGISTER_ROLES = ['vehicle_owner', 'driver', 'organization', 'passenger'] as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!PUBLIC_REGISTER_ROLES.includes(dto.role as (typeof PUBLIC_REGISTER_ROLES)[number])) {
      throw new ForbiddenException(
        'Admin accounts cannot be created by public registration. Ask an existing admin to create one.',
      );
    }
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name, phone: dto.phone, role: dto.role },
    });
    // New accounts start pending approval and get NO token: they cannot log
    // in (or call protected APIs) until an admin approves them.
    return {
      user: publicUser(user),
      message: 'Account created and pending approval. An admin will review it before you can log in.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    if (user.status !== 'active') throw new UnauthorizedException('This account is deactivated');
    if (user.approvalStatus === 'pending') {
      throw new ForbiddenException('Your account is pending approval. An admin must approve it before you can log in.');
    }
    if (user.approvalStatus === 'rejected') {
      throw new ForbiddenException('Your registration was rejected. Contact a LEZIT Admin.');
    }
    return { accessToken: this.sign(user.id, user.email, user.role), user: publicUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return publicUser(user);
  }

  private sign(sub: string, email: string, role: string) {
    return this.jwt.sign({ sub, email, role });
  }
}
