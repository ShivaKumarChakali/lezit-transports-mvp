import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { SchedulesService } from './schedules.service';

class CreateScheduleDto {
  @IsString()
  routeId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsString()
  departureTime!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];
}

class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  departureTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  list(@Req() req: { user: { sub: string; role: string } }, @Query('routeId') routeId?: string) {
    return this.schedules.list(req.user.sub, req.user.role, routeId);
  }

  @Roles('super_admin', 'lezit_admin')
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedules.create(dto);
  }

  @Get(':id')
  get(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.schedules.get(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedules.update(id, dto);
  }
}
