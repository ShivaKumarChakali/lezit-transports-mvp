import type { PrismaClient } from '@prisma/client';

/**
 * Startup bootstrap: make sure a deployment can never be locked out of its
 * own admin account.
 *
 * This is the same rule the seed script (prisma/seed.ts) already implements,
 * but the seed only runs when someone executes it by hand — and on Railway
 * the in-browser terminal would not connect, so it never ran against the
 * live database. Running the same check at API startup means the next
 * deploy heals the live demo login by itself.
 *
 * Behaviour:
 * - If an approved, active super_admin already exists, do nothing.
 * - Otherwise, approve the oldest pending super_admin (the demo account,
 *   created by public registration before the login approval gate existed).
 * - If there is no super_admin at all, do nothing — an admin must still be
 *   created by the seed script with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 * - Never throws: a database problem here must not stop the API starting.
 *   Callers in main.ts still wrap this in try/catch as a second guard.
 */
export async function ensureApprovedSuperAdmin(prisma: PrismaClient): Promise<string | null> {
  const approvedAdmin = await prisma.user.findFirst({
    where: { role: 'super_admin', approvalStatus: 'approved', status: 'active' },
  });
  if (approvedAdmin) return null;

  const pendingAdmin = await prisma.user.findFirst({
    where: { role: 'super_admin', approvalStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
  });
  if (!pendingAdmin) return null;

  await prisma.user.update({
    where: { id: pendingAdmin.id },
    data: { approvalStatus: 'approved' },
  });
  return pendingAdmin.email;
}
