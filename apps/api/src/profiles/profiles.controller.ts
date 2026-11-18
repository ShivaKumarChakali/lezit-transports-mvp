import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ProfilesService } from './profiles.service';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  licenceNumber?: string;

  @IsOptional()
  @IsDateString()
  licenceExpiry?: string;

  @IsOptional()
  @IsString()
  orgName?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  me(@Req() req: { user: { sub: string; role: string } }) {
    return this.profiles.getMe(req.user.sub, req.user.role);
  }

  @Patch('me')
  updateMe(@Req() req: { user: { sub: string; role: string } }, @Body() dto: UpdateProfileDto) {
    return this.profiles.updateMe(req.user.sub, req.user.role, dto);
  }

  @Roles('super_admin', 'lezit_admin')
  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.profiles.getByUserId(userId);
  }
}
