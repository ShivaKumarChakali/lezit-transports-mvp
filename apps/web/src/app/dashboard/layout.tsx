'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { clearAuth, getStoredUser } from '@/lib/auth';
import { DASHBOARD_ROLES, ROLE_DASHBOARDS } from '@/lib/roles';

// Client-side role guard for the dashboard shell. The Next.js middleware
// already redirects wrong-role visits, and the API enforces roles on every
// endpoint; this guard stops the shell (sidebar + page) flashing for a
// wrong-role user if they reach the layout another way.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const segment = pathname.split('/')[2] ?? '';
    const expectedRole = DASHBOARD_ROLES[segment];
    if (expectedRole && expectedRole !== user.role) {
      router.replace(ROLE_DASHBOARDS[user.role]);
      return;
    }
    setAllowed(true);
  }, [pathname, router]);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  if (!allowed) return <main className="main"><p className="muted">Checking access…</p></main>;

  return (
    <div className="layout">
      {/* The sidebar is hidden on narrow viewports (see globals.css), so the
          dashboard needs a logout control that stays reachable there too. */}
      <header className="mobile-topbar">
        <Link href="/">
          <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
        </Link>
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
