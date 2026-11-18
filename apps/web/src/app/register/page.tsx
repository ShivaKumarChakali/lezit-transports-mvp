'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, saveAuth, type AuthUser } from '@/lib/auth';
import { ALL_ROLES, ROLE_DASHBOARDS, ROLE_LABELS } from '@/lib/roles';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ALL_ROLES[2]);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api<{ accessToken: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone: phone || undefined, password, role }),
      });
      saveAuth(res.accessToken, res.user);
      router.push(ROLE_DASHBOARDS[res.user.role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <main className="container" style={{ maxWidth: 480 }}>
      <div className="card" style={{ marginTop: 48 }}>
        <h1>Register</h1>
        <p className="muted">New accounts start as pending approval. An admin approves owner, driver and vehicle records.</p>
        <form onSubmit={onSubmit}>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="label" htmlFor="phone">Phone (optional)</label>
          <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="label" htmlFor="password">Password (min 8 characters)</label>
          <input id="password" className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <label className="label" htmlFor="role">Register as</label>
          <select id="role" className="input" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit" style={{ width: '100%' }}>Create account</button>
        </form>
        <p className="muted">Already have an account? <Link href="/login" style={{ color: '#b8932b', fontWeight: 600 }}>Log in</Link></p>
      </div>
    </main>
  );
}
