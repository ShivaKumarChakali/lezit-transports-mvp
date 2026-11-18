'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import { api, type AuthUser } from '@/lib/auth';
import type { ApiProfile } from '@/lib/api-types';

export default function PassengerDashboard() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [orgId, setOrgId] = useState('');

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
        setEmployeeId(String(p.profile.employeeId ?? ''));
        setOrgId(String(p.profile.orgId ?? ''));
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

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({ employeeId: employeeId || undefined, orgId: orgId || undefined }),
      });
      setNotice('Profile saved.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile save failed');
    }
  }

  return (
    <div>
      <h1>Passenger Dashboard</h1>
      <p className="muted">Passenger registration, profile and contact details. Phase 1 is account access only.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p>{notice}</p>}
      <div className="grid">
        <DashboardCard title="My transport" value="—" note="Phase 2: assigned vehicle, driver, route and schedule" />
        <DashboardCard title="Pickup & drop" value="—" note="Phase 2: pickup and drop locations" />
        <DashboardCard title="Booking status" value="—" note="Phase 2: booking status and trip history" />
        <DashboardCard title="Attendance" value="—" note="Phase 2: basic attendance history" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Passenger profile</h3>
        <p className="muted">Account status: {me ? me.approvalStatus : '—'}</p>
        <form onSubmit={saveProfile}>
          <label className="label" htmlFor="employeeId">Employee / student ID (optional)</label>
          <input id="employeeId" className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          <label className="label" htmlFor="orgId">Organization ID (optional)</label>
          <input id="orgId" className="input" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
          <button className="btn" type="submit">Save profile</button>
        </form>
        {profile === null && !loading && <p className="muted">No passenger profile saved yet — fill in the form above.</p>}
      </div>
    </div>
  );
}
