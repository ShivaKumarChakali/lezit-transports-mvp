import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { AttendanceService } from './attendance.service';

class AttendanceDto {
  @IsString()
  tripId!: string;

  @IsString()
  passengerId!: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}

class CheckOutDto {
  @IsString()
  tripId!: string;

  @IsString()
  passengerId!: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Roles('super_admin', 'lezit_admin', 'driver')
  @Post('check-in')
  checkIn(@Req() req: { user: { sub: string; role: string } }, @Body() dto: AttendanceDto) {
    return this.attendance.checkIn(req.user.sub, req.user.role, dto.tripId, dto.passengerId, dto.bookingId);
  }

  @Roles('super_admin', 'lezit_admin', 'driver')
  @Post('check-out')
  checkOut(@Req() req: { user: { sub: string; role: string } }, @Body() dto: CheckOutDto) {
    return this.attendance.checkOut(req.user.sub, req.user.role, dto.tripId, dto.passengerId);
  }

  @Roles('super_admin', 'lezit_admin', 'driver', 'passenger')
  @Get()
  list(
    @Req() req: { user: { sub: string; role: string } },
    @Query('tripId') tripId?: string,
  ) {
    return this.attendance.list(req.user.sub, req.user.role, tripId);
  }
}
