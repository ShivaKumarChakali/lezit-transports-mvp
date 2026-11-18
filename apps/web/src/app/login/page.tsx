'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, saveAuth, type AuthUser } from '@/lib/auth';
import { ROLE_DASHBOARDS } from '@/lib/roles';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api<{ accessToken: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveAuth(res.accessToken, res.user);
      router.push(ROLE_DASHBOARDS[res.user.role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
        </div>
        <div className="card">
          <h1>Log in</h1>
          <form onSubmit={onSubmit}>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="error">{error}</p>}
            <button className="btn" type="submit" style={{ width: '100%' }}>Log in</button>
          </form>
          <p className="muted">No account? <Link href="/register" style={{ color: '#b8932b', fontWeight: 600 }}>Register</Link></p>
        </div>
      </div>
    </main>
  );
}
