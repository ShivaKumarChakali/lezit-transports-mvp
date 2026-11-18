'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import { api, type AuthUser } from '@/lib/auth';
import type { ApiProfile } from '@/lib/api-types';

export default function OrganizationDashboard() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');

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
        setOrgName(String(p.profile.orgName ?? ''));
        setContactPerson(String(p.profile.contactPerson ?? ''));
        setAddress(String(p.profile.address ?? ''));
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
        body: JSON.stringify({ orgName, contactPerson: contactPerson || undefined, address: address || undefined }),
      });
      setNotice('Profile saved.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile save failed');
    }
  }

  return (
    <div>
      <h1>Organization Dashboard</h1>
      <p className="muted">Organization registration, profile and contact information. Phase 1 is account access only.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p>{notice}</p>}
      <div className="grid">
        <DashboardCard title="Profile" value={orgName || '—'} note="Organization profile and contact information" />
        <DashboardCard title="Passengers" value="—" note="Phase 2: employee / student passenger registration" />
        <DashboardCard title="Assigned transport" value="—" note="Phase 2: assigned routes, schedules and vehicles" />
        <DashboardCard title="Attendance" value="—" note="Phase 2: passenger attendance overview" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Organization profile</h3>
        <p className="muted">Account status: {me ? me.approvalStatus : '—'}</p>
        <form onSubmit={saveProfile}>
          <label className="label" htmlFor="orgName">Organization name</label>
          <input id="orgName" className="input" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          <label className="label" htmlFor="contactPerson">Contact person</label>
          <input id="contactPerson" className="input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          <label className="label" htmlFor="address">Address</label>
          <input id="address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          <button className="btn" type="submit">Save profile</button>
        </form>
        {profile === null && !loading && <p className="muted">No organization profile saved yet — fill in the form above.</p>}
      </div>
    </div>
  );
}
