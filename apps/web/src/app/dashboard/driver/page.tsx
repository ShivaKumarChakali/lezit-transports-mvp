'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { api, type AuthUser } from '@/lib/auth';
import { formatDateOnly } from '@/lib/dates';
import { assignedVehicleFromTrips, vehicleLabel } from '@/lib/trips';
import type { ApiBooking, ApiProfile, ApiTrip } from '@/lib/api-types';

export default function DriverDashboard() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile>(null);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [tripBookings, setTripBookings] = useState<ApiBooking[]>([]);
  const [activeTripId, setActiveTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceExpiry, setLicenceExpiry] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, p, t] = await Promise.all([
        api<AuthUser>('/auth/me'),
        api<{ role: string; profile: ApiProfile }>('/profiles/me'),
        api<ApiTrip[]>('/trips'),
      ]);
      setMe(m);
      setProfile(p.profile);
      setTrips(t);
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

  async function loadTripBookings(tripId: string) {
    setActiveTripId(tripId);
    setError('');
    try {
      setTripBookings(await api<ApiBooking[]>(`/trips/${tripId}/bookings`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load trip passengers');
    }
  }

  async function tripAction(tripId: string, action: 'start' | 'complete') {
    setError('');
    try {
      await api(`/trips/${tripId}/${action}`, { method: 'PATCH' });
      setNotice(`Trip ${action === 'start' ? 'started' : 'completed'}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trip action failed');
    }
  }

  async function attendance(tripId: string, passengerId: string, bookingId: string | null, action: 'check-in' | 'check-out') {
    setError('');
    try {
      await api(`/attendance/${action}`, {
        method: 'POST',
        body: JSON.stringify({ tripId, passengerId, ...(bookingId ? { bookingId } : {}) }),
      });
      setNotice(`Passenger ${action === 'check-in' ? 'checked in' : 'checked out'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attendance action failed');
    }
  }

  // The assigned vehicle comes from the driver's trips (see lib/trips.ts):
  // the vehicle of an in-progress trip first, then a scheduled one.
  const assignedVehicle = assignedVehicleFromTrips(trips);

  return (
    <div>
      <PageHeader title="Driver Dashboard" subtitle="Profile, driving licence, identity documents and verification status." />
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}
      <div className="grid">
        <DashboardCard title="Licence" value={licenceNumber || '—'} note="Driving licence information and expiry" />
        <DashboardCard title="Verification" value={me ? me.approvalStatus : '—'} note="Identity document uploads and verification status" />
        <DashboardCard
          title="Assigned vehicle"
          value={assignedVehicle ? vehicleLabel(assignedVehicle) : '—'}
          note={assignedVehicle ? 'Vehicle for your current trip' : 'No trips assigned yet — your vehicle will show here once a trip is assigned'}
        />
        <DashboardCard title="Today's trips" value={loading ? '—' : String(trips.length)} note="Your assigned trips" />
      </div>
      <div className="card section">
        <h3>My trips</h3>
        {trips.length === 0 && <p className="muted">No trips assigned yet.</p>}
        <div className="row-list">
          {trips.map((t) => (
            <div className="row" key={t.id}>
              <span className="row-text">{formatDateOnly(t.date)}</span>
              <StatusBadge status={t.status} />
              <span className="row-actions">
                {t.status === 'scheduled' && (
                  <button className="btn" onClick={() => void tripAction(t.id, 'start')}>Start trip</button>
                )}
                {t.status === 'in_progress' && (
                  <button className="btn" onClick={() => void tripAction(t.id, 'complete')}>Complete trip</button>
                )}
                <button className="btn btn-secondary" onClick={() => void loadTripBookings(t.id)}>Passengers</button>
              </span>
            </div>
          ))}
        </div>
        {activeTripId && (
          <div className="form-block">
            <h3>Passengers on this trip</h3>
            {tripBookings.length === 0 && <p className="muted">No bookings on this trip.</p>}
            <div className="row-list">
              {tripBookings.map((b) => (
                <div className="row" key={b.id}>
                  <span className="row-text">{b.seats} seat(s)</span>
                  <StatusBadge status={b.status} />
                  <span className="row-actions">
                    <button className="btn" onClick={() => void attendance(activeTripId, b.passengerId, b.id, 'check-in')}>Check in</button>
                    <button className="btn btn-secondary" onClick={() => void attendance(activeTripId, b.passengerId, b.id, 'check-out')}>Check out</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="card section">
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
