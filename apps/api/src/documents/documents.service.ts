import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateDocumentDto {
  fileName: string;
  fileType?: string;
  documentKind?: string;
  fileUrl?: string;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateDocumentDto) {
    return this.prisma.document.create({ data: { userId, ...dto } });
  }

  list(userId: string, role: string) {
    // Admins see every document; everyone else sees only their own.
    const where = role === 'super_admin' || role === 'lezit_admin' ? {} : { userId };
    return this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async get(id: string, userId: string, role: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    const isAdmin = role === 'super_admin' || role === 'lezit_admin';
    if (!isAdmin && doc.userId !== userId) {
      throw new ForbiddenException('You can only view your own documents');
    }
    return doc;
  }

  async verify(id: string, verified: boolean) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return this.prisma.document.update({ where: { id }, data: { verified } });
  }
}
