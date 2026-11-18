'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

// /logout is a real route: it clears the stored session (localStorage token
// + auth cookie) and sends the user to the login page. The dashboard header
// and the sidebar both offer logout, so it works on every viewport.
export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAuth();
    router.replace('/login');
  }, [router]);

  return (
    <main className="container">
      <p className="muted">Signing you out…</p>
    </main>
  );
}
