'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getStoredUser } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/roles';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard/super-admin', label: 'Super Admin' },
  { href: '/dashboard/admin', label: 'LEZIT Admin' },
  { href: '/dashboard/owner', label: 'Vehicle Owner' },
  { href: '/dashboard/driver', label: 'Driver' },
  { href: '/dashboard/organization', label: 'Organization' },
  { href: '/dashboard/passenger', label: 'Passenger' },
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
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
            {item.label}
          </Link>
        ))}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            clearAuth();
            router.push('/login');
          }}
        >
          Log out
        </a>
      </nav>
    </aside>
  );
}
