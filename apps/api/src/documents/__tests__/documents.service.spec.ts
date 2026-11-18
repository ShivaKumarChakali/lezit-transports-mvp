import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentsService } from '../documents.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeService() {
  const prisma = {
    document: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
  return {
    service: new DocumentsService(prisma),
    prisma: prisma as unknown as { document: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } },
  };
}

const doc = { id: 'doc-1', userId: 'owner-1', fileName: 'licence.pdf', verified: false };

describe('DocumentsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a document record for the caller', async () => {
    const { service, prisma } = makeService();
    prisma.document.create.mockResolvedValue(doc);
    await expect(
      service.create('owner-1', { fileName: 'licence.pdf', documentKind: 'licence' }),
    ).resolves.toEqual(doc);
    expect(prisma.document.create).toHaveBeenCalledWith({
      data: { userId: 'owner-1', fileName: 'licence.pdf', documentKind: 'licence' },
    });
  });

  it('scopes the list to the caller for non-admins and shows all for admins', async () => {
    const { service, prisma } = makeService();
    prisma.document.findMany.mockResolvedValue([doc]);
    await service.list('owner-1', 'vehicle_owner');
    expect(prisma.document.findMany).toHaveBeenCalledWith({ where: { userId: 'owner-1' }, orderBy: { createdAt: 'desc' } });
    await service.list('admin-1', 'super_admin');
    expect(prisma.document.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { createdAt: 'desc' } });
  });

  it('forbids a non-owner from fetching a document', async () => {
    const { service, prisma } = makeService();
    prisma.document.findUnique.mockResolvedValue(doc);
    await expect(service.get('doc-1', 'owner-2', 'vehicle_owner')).rejects.toThrow(ForbiddenException);
    await expect(service.get('doc-1', 'owner-1', 'vehicle_owner')).resolves.toEqual(doc);
    await expect(service.get('doc-1', 'admin-1', 'lezit_admin')).resolves.toEqual(doc);
  });

  it('throws NotFound for a missing document', async () => {
    const { service, prisma } = makeService();
    prisma.document.findUnique.mockResolvedValue(null);
    await expect(service.get('missing', 'owner-1', 'vehicle_owner')).rejects.toThrow(NotFoundException);
  });

  it('marks a document verified', async () => {
    const { service, prisma } = makeService();
    prisma.document.findUnique.mockResolvedValue(doc);
    prisma.document.update.mockResolvedValue({ ...doc, verified: true });
    await expect(service.verify('doc-1', true)).resolves.toEqual({ ...doc, verified: true });
  });
});
