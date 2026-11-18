import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { TripsService } from './trips.service';

class CreateTripDto {
  @IsString()
  routeId!: string;

  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsDateString()
  date!: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Roles('super_admin', 'lezit_admin', 'driver', 'vehicle_owner')
  @Get()
  list(@Req() req: { user: { sub: string; role: string } }) {
    return this.trips.list(req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin')
  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.trips.create(dto);
  }

  @Roles('super_admin', 'lezit_admin', 'driver', 'vehicle_owner')
  @Get(':id')
  get(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.trips.get(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin', 'driver')
  @Get(':id/bookings')
  getBookings(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.trips.getBookings(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin', 'driver')
  @Patch(':id/start')
  start(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.trips.start(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin', 'driver')
  @Patch(':id/complete')
  complete(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.trips.complete(id, req.user.sub, req.user.role);
  }
}
