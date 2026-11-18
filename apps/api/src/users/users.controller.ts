import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UsersService } from './users.service';

class ApprovalDto {
  @IsEnum(ApprovalStatus)
  approvalStatus!: ApprovalStatus;
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
}
