import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateRouteDto {
  name: string;
  startLocation: string;
  endLocation: string;
  stops?: string[];
}

export interface UpdateRouteDto {
  name?: string;
  startLocation?: string;
  endLocation?: string;
  stops?: string[];
}

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createdById: string, dto: CreateRouteDto) {
    return this.prisma.route.create({ data: { ...dto, createdById } });
  }

  list() {
    return this.prisma.route.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async update(id: string, dto: UpdateRouteDto) {
    await this.get(id);
    return this.prisma.route.update({ where: { id }, data: dto });
  }
}
