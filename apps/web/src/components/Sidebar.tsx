'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getStoredUser } from '@/lib/auth';
import { ROLE_DASHBOARDS, ROLE_LABELS, type Role } from '@/lib/roles';

const NAV: { href: string; label: string; role: Role }[] = [
  { href: '/dashboard/super-admin', label: 'Super Admin', role: 'super_admin' },
  { href: '/dashboard/admin', label: 'LEZIT Admin', role: 'lezit_admin' },
  { href: '/dashboard/owner', label: 'Vehicle Owner', role: 'vehicle_owner' },
  { href: '/dashboard/driver', label: 'Driver', role: 'driver' },
  { href: '/dashboard/organization', label: 'Organization', role: 'organization' },
  { href: '/dashboard/passenger', label: 'Passenger', role: 'passenger' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  return (
    <aside className="sidebar">
      <Link href="/">
        {/* Transparent LEZIT logo, gold on black */}
        <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
      </Link>
      <p className="muted" style={{ color: '#d4af37' }}>
        {user ? `${user.name} · ${ROLE_LABELS[user.role]}` : 'LEZIT Transport MVP'}
      </p>
      <nav>
        {/* Only the signed-in user's own dashboard is linked: other roles'
            dashboards are not reachable from here (middleware + API also block them). */}
        {NAV.filter((item) => user && item.role === user.role).map((item) => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
            {item.label}
          </Link>
        ))}
        <span className="nav-logout">
          <button
            type="button"
            className="nav-link"
            onClick={() => {
              clearAuth();
              router.push('/login');
            }}
          >
            Log out
          </button>
        </span>
      </nav>
    </aside>
  );
}
