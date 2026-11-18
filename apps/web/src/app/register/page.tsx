'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, type AuthUser } from '@/lib/auth';
import { PUBLIC_ROLES, ROLE_LABELS } from '@/lib/roles';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(PUBLIC_ROLES[0]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // Public registration creates a pending account and returns NO token:
      // the user must wait for admin approval, then log in.
      await api<{ user: AuthUser; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone: phone || undefined, password, role }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
        </div>
        <div className="card">
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
            {PUBLIC_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit" style={{ width: '100%' }}>Create account</button>
        </form>
        {done && (
          <p style={{ marginTop: 12 }}>
            Account created and pending approval. An admin will review it — you can log in once it is approved.
          </p>
        )}
        <p className="muted">Already have an account? <Link href="/login" style={{ color: '#b8932b', fontWeight: 600 }}>Log in</Link></p>
        </div>
      </div>
    </main>
  );
}
