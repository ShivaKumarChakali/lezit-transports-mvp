import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { VehiclesService } from './vehicles.service';

class CreateVehicleDto {
  @IsString()
  registrationNumber!: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  seatCapacity?: number;
}

class VehicleApprovalDto {
  @IsEnum(ApprovalStatus)
  approvalStatus!: ApprovalStatus;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Roles('super_admin', 'lezit_admin', 'vehicle_owner')
  @Get()
  list(@Req() req: { user: { sub: string; role: string } }) {
    return this.vehicles.list(req.user.sub, req.user.role);
  }

  @Roles('vehicle_owner')
  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateVehicleDto) {
    return this.vehicles.create(req.user.sub, dto);
  }

  @Roles('super_admin', 'lezit_admin', 'vehicle_owner')
  @Get(':id')
  get(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.vehicles.get(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id/approval')
  setApproval(@Param('id') id: string, @Body() dto: VehicleApprovalDto) {
    return this.vehicles.setApproval(id, dto.approvalStatus);
  }
}
