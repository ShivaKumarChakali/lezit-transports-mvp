/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed / bootstrap an approved Super Admin.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='...' npm run seed
 *
 * - If SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD are set, that account is
 *   created (or updated) as an approved, active super_admin.
 * - If they are not set, the script does NOT invent credentials. It only
 *   approves the oldest pending super_admin, if one exists and no approved
 *   super_admin exists yet — so a deployment can never be locked out of its
 *   own admin account. This is the bootstrap path for the demo account,
 *   which was created by public registration (pending) before the login
 *   approval gate existed.
 * - The password is never written into this file or the repo; it comes from
 *   the environment only.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME ?? 'LEZIT Super Admin';

    if (email && password) {
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = await prisma.user.upsert({
        where: { email },
        update: { passwordHash, name, role: 'super_admin', approvalStatus: 'approved', status: 'active' },
        create: {
          email,
          passwordHash,
          name,
          role: 'super_admin',
          approvalStatus: 'approved',
          status: 'active',
        },
      });
      console.log(`Seeded approved super_admin: ${admin.email}`);
      return;
    }

    const approvedAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin', approvalStatus: 'approved', status: 'active' },
    });
    if (approvedAdmin) {
      console.log(`Approved super_admin already exists: ${approvedAdmin.email}`);
      return;
    }
    const pendingAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin', approvalStatus: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
    if (!pendingAdmin) {
      console.log('No super_admin account found. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.');
      return;
    }
    await prisma.user.update({
      where: { id: pendingAdmin.id },
      data: { approvalStatus: 'approved' },
    });
    console.log(`Approved existing pending super_admin: ${pendingAdmin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
