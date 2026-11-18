import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { DocumentsService } from './documents.service';

class CreateDocumentDto {
  @IsString()
  fileName!: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  documentKind?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}

class VerifyDocumentDto {
  @IsBoolean()
  verified!: boolean;
}

// Document management is metadata only in Phase 1: no file storage provider
// is wired up yet. fileUrl is a placeholder for the storage location once a
// provider is chosen; uploads themselves are out of scope for Phase 1.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateDocumentDto) {
    return this.documents.create(req.user.sub, dto);
  }

  @Get()
  list(@Req() req: { user: { sub: string; role: string } }) {
    return this.documents.list(req.user.sub, req.user.role);
  }

  @Get(':id')
  get(@Req() req: { user: { sub: string; role: string } }, @Param('id') id: string) {
    return this.documents.get(id, req.user.sub, req.user.role);
  }

  @Roles('super_admin', 'lezit_admin')
  @Patch(':id/verify')
  verify(@Param('id') id: string, @Body() dto: VerifyDocumentDto) {
    return this.documents.verify(id, dto.verified);
  }
}
