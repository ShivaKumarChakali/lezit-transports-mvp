'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { api, type AuthUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/dates';
import type { ApiAttendance, ApiBooking, ApiProfile } from '@/lib/api-types';

export default function PassengerDashboard() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile>(null);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [attendance, setAttendance] = useState<ApiAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [orgId, setOrgId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, p, b, a] = await Promise.all([
        api<AuthUser>('/auth/me'),
        api<{ role: string; profile: ApiProfile }>('/profiles/me'),
        api<ApiBooking[]>('/bookings'),
        api<ApiAttendance[]>('/attendance'),
      ]);
      setMe(m);
      setProfile(p.profile);
      setBookings(b);
      setAttendance(a);
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
      <PageHeader title="Passenger Dashboard" subtitle="Passenger registration, profile and contact details. Phase 1 is account access only." />
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}
      <div className="grid">
        <DashboardCard title="My transport" value={loading ? '—' : String(bookings.filter((b) => b.status === 'confirmed').length)} note="Confirmed bookings" />
        <DashboardCard title="Pickup & drop" value="—" note="See your booking's route for pickup and drop locations" />
        <DashboardCard title="Booking status" value={loading ? '—' : String(bookings.length)} note="Your bookings" />
        <DashboardCard title="Attendance" value={loading ? '—' : String(attendance.length)} note="Your check-in / check-out records" />
      </div>
      <div className="card section">
        <h3>My bookings</h3>
        {bookings.length === 0 && <p className="muted">No bookings yet — an admin creates bookings for you.</p>}
        <div className="row-list">
          {bookings.map((b) => (
            <div className="row" key={b.id}>
              <span className="row-text">{b.seats} seat(s) · booked {new Date(b.createdAt).toLocaleDateString()}</span>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
      <div className="card section">
        <h3>Attendance history</h3>
        {attendance.length === 0 && <p className="muted">No attendance records yet.</p>}
        <div className="row-list">
          {attendance.map((a) => (
            <div className="row" key={a.id}>
              <span className="row-text">
                checked in {formatDateTime(a.checkInAt)}
                {a.checkOutAt ? ` · checked out ${formatDateTime(a.checkOutAt)}` : ''}
              </span>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>
      <div className="card section">
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
