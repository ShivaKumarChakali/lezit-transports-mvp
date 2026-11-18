import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BookingStatus } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { BookingsService } from './bookings.service';

class CreateBookingDto {
  @IsString()
  passengerId!: string;

  @IsString()
  routeId!: string;

  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;
}

class BookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}

// Manual bookings are created by admins (no self-service booking in the MVP).
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Roles('super_admin', 'lezit_admin')
  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateBookingDto) {
    return this.bookings.create(req.user.sub, dto);
  }

  @Roles('super_admin', 'lezit_admin', 'passenger')
  @Get()
  list(@Req() req: { user: { sub: string; role: string } }) {
    return this.bookings.list(req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin', 'passenger')
  @Get(':id')
  get(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.bookings.get(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: BookingStatusDto) {
    return this.bookings.setStatus(id, dto.status);
  }
}
