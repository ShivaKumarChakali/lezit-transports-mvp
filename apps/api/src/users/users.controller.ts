import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AccountStatus, ApprovalStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UsersService } from './users.service';

class ApprovalDto {
  @IsEnum(ApprovalStatus)
  approvalStatus!: ApprovalStatus;
}

class StatusDto {
  @IsEnum(AccountStatus)
  status!: AccountStatus;
}

class CreateAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(Role)
  role!: Role;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles('super_admin', 'lezit_admin')
  @Get()
  list() {
    return this.users.list();
  }

  @Roles('super_admin', 'lezit_admin')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.get(id);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id/approval')
  setApproval(@Param('id') id: string, @Body() dto: ApprovalDto) {
    return this.users.setApproval(id, dto.approvalStatus);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.users.setStatus(id, dto.status);
  }

  // Only a super_admin can create another admin account, and only with an
  // admin role. Other roles must use public self-registration.
  @Roles('super_admin')
  @Post()
  createAdmin(@Body() dto: CreateAdminDto) {
    if (dto.role !== 'super_admin' && dto.role !== 'lezit_admin') {
      throw new ForbiddenException('POST /users creates admin accounts only');
    }
    return this.users.createAdmin(dto);
  }
}
