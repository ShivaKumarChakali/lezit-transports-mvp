'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import { api, type AuthUser } from '@/lib/auth';
import type { ApiProfile } from '@/lib/api-types';

export default function DriverDashboard() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceExpiry, setLicenceExpiry] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, p] = await Promise.all([
        api<AuthUser>('/auth/me'),
        api<{ role: string; profile: ApiProfile }>('/profiles/me'),
      ]);
      setMe(m);
      setProfile(p.profile);
      if (p.profile) {
        setLicenceNumber(String(p.profile.licenceNumber ?? ''));
        const expiry = p.profile.licenceExpiry;
        setLicenceExpiry(typeof expiry === 'string' ? expiry.slice(0, 10) : '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveLicence(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({ licenceNumber, licenceExpiry: licenceExpiry || undefined }),
      });
      setNotice('Licence details saved — an admin will verify them.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Licence save failed');
    }
  }

  return (
    <div>
      <h1>Driver Dashboard</h1>
      <p className="muted">Profile, driving licence, identity documents and verification status.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p>{notice}</p>}
      <div className="grid">
        <DashboardCard title="Licence" value={licenceNumber || '—'} note="Driving licence information and expiry" />
        <DashboardCard title="Verification" value={me ? me.approvalStatus : '—'} note="Identity document uploads and verification status" />
        <DashboardCard title="Assigned vehicle" value="—" note="No vehicle assigned yet — assignments arrive in Phase 2" />
        <DashboardCard title="Today's trips" value="—" note="Phase 2: daily trip schedules and passenger lists" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Driving licence</h3>
        <form onSubmit={saveLicence}>
          <label className="label" htmlFor="licenceNumber">Licence number</label>
          <input id="licenceNumber" className="input" required value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)} />
          <label className="label" htmlFor="licenceExpiry">Licence expiry</label>
          <input id="licenceExpiry" className="input" type="date" value={licenceExpiry} onChange={(e) => setLicenceExpiry(e.target.value)} />
          <button className="btn" type="submit">Save licence</button>
        </form>
        {profile === null && !loading && <p className="muted">No licence saved yet — fill in the form above.</p>}
      </div>
    </div>
  );
}
