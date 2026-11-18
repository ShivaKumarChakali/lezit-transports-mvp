import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { RoutesService } from './routes.service';

class CreateRouteDto {
  @IsString()
  name!: string;

  @IsString()
  startLocation!: string;

  @IsString()
  endLocation!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stops?: string[];
}

class UpdateRouteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsString()
  endLocation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stops?: string[];
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  list() {
    return this.routes.list();
  }

  @Roles('super_admin', 'lezit_admin')
  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateRouteDto) {
    return this.routes.create(req.user.sub, dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.routes.get(id);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routes.update(id, dto);
  }
}
