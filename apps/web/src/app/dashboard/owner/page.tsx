'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { api, type AuthUser } from '@/lib/auth';
import { formatDateOnly } from '@/lib/dates';
import type { ApiDocument, ApiProfile, ApiSchedule, ApiTrip, ApiVehicle } from '@/lib/api-types';

export default function OwnerDashboard() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [profile, setProfile] = useState<ApiProfile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [regNo, setRegNo] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [seats, setSeats] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [docName, setDocName] = useState('');
  const [docKind, setDocKind] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, v, d, p, s, t] = await Promise.all([
        api<AuthUser>('/auth/me'),
        api<ApiVehicle[]>('/vehicles'),
        api<ApiDocument[]>('/documents'),
        api<{ role: string; profile: ApiProfile }>('/profiles/me'),
        api<ApiSchedule[]>('/schedules'),
        api<ApiTrip[]>('/trips'),
      ]);
      setMe(m);
      setVehicles(v);
      setDocuments(d);
      setSchedules(s);
      setTrips(t);
      setProfile(p.profile);
      if (p.profile) {
        setBusinessName(String(p.profile.businessName ?? ''));
        setGstNumber(String(p.profile.gstNumber ?? ''));
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

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await api('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          registrationNumber: regNo,
          make: make || undefined,
          model: model || undefined,
          year: year ? Number(year) : undefined,
          seatCapacity: seats ? Number(seats) : undefined,
        }),
      });
      setRegNo('');
      setMake('');
      setModel('');
      setYear('');
      setSeats('');
      setNotice('Vehicle registered — pending admin approval.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vehicle registration failed');
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({ businessName, gstNumber: gstNumber || undefined, address: address || undefined }),
      });
      setNotice('Profile saved.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile save failed');
    }
  }

  async function addDocument(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/documents', {
        method: 'POST',
        body: JSON.stringify({ fileName: docName, documentKind: docKind || undefined }),
      });
      setDocName('');
      setDocKind('');
      setNotice('Document record added (metadata only — file upload storage is not connected yet).');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document save failed');
    }
  }

  return (
    <div>
      <PageHeader title="Vehicle Owner Dashboard" subtitle="Profile, business documents, vehicles and drivers — and your approval status." />
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}
      <div className="grid">
        <DashboardCard title="My vehicles" value={loading ? '—' : String(vehicles.length)} note="Vehicle registration and approval status" />
        <DashboardCard title="My drivers" value="—" note="Driver information and approval status — drivers register themselves in Phase 1" />
        <DashboardCard title="Documents" value={loading ? '—' : String(documents.length)} note="Identity and business document records" />
        <DashboardCard title="Approval status" value={me ? me.approvalStatus : '—'} note="Shown after an admin reviews your registration" />
      </div>

      <div className="card section">
        <h3>My vehicles</h3>
        {vehicles.length === 0 && <p className="muted">No vehicles registered yet.</p>}
        <div className="row-list">
          {vehicles.map((v) => (
            <div className="row" key={v.id}>
              <span className="row-text">
                {v.registrationNumber} {v.make ? `· ${v.make} ${v.model ?? ''}` : ''} · {v.seatCapacity ? `${v.seatCapacity} seats` : 'seats not set'}
              </span>
              <StatusBadge status={v.approvalStatus} />
            </div>
          ))}
        </div>
        <form onSubmit={addVehicle} className="form-block">
          <h3>Register a vehicle</h3>
          <label className="label" htmlFor="regNo">Registration number</label>
          <input id="regNo" className="input" required value={regNo} onChange={(e) => setRegNo(e.target.value)} />
          <label className="label" htmlFor="make">Make</label>
          <input id="make" className="input" value={make} onChange={(e) => setMake(e.target.value)} />
          <label className="label" htmlFor="model">Model</label>
          <input id="model" className="input" value={model} onChange={(e) => setModel(e.target.value)} />
          <label className="label" htmlFor="year">Year</label>
          <input id="year" className="input" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <label className="label" htmlFor="seats">Seat capacity</label>
          <input id="seats" className="input" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
          <button className="btn" type="submit">Register vehicle</button>
        </form>
      </div>

      <div className="card section">
        <h3>Schedules &amp; trips using my vehicles</h3>
        {schedules.length === 0 && <p className="muted">No schedules use your vehicles yet.</p>}
        <div className="row-list">
          {schedules.map((s) => (
            <div className="row" key={s.id}>
              <span className="row-text">{s.departureTime} · {s.days.join(', ') || 'no days set'}</span>
              <StatusBadge status={s.active ? 'active' : 'inactive'} />
            </div>
          ))}
          {trips.map((t) => (
            <div className="row" key={t.id}>
              <span className="row-text">{formatDateOnly(t.date)}</span>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
        {trips.length === 0 && <p className="muted">No trips use your vehicles yet.</p>}
      </div>

      <div className="card section">
        <h3>Business profile</h3>
        <form onSubmit={saveProfile}>
          <label className="label" htmlFor="businessName">Business name</label>
          <input id="businessName" className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <label className="label" htmlFor="gstNumber">GST number (optional)</label>
          <input id="gstNumber" className="input" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
          <label className="label" htmlFor="address">Address</label>
          <input id="address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          <button className="btn" type="submit">Save profile</button>
        </form>
      </div>

      <div className="card section">
        <h3>Documents</h3>
        <p className="muted">Metadata only in Phase 1 — no file storage provider is connected yet.</p>
        {documents.length === 0 && <p className="muted">No documents recorded yet.</p>}
        <div className="row-list">
          {documents.map((d) => (
            <div className="row" key={d.id}>
              <span className="row-text">
                {d.fileName} {d.documentKind ? `· ${d.documentKind}` : ''}
              </span>
              <StatusBadge status={d.verified ? 'verified' : 'not verified'} />
            </div>
          ))}
        </div>
        <form onSubmit={addDocument} className="form-block">
          <label className="label" htmlFor="docName">Document name</label>
          <input id="docName" className="input" required value={docName} onChange={(e) => setDocName(e.target.value)} />
          <label className="label" htmlFor="docKind">Document type (e.g. identity, business, vehicle)</label>
          <input id="docKind" className="input" value={docKind} onChange={(e) => setDocKind(e.target.value)} />
          <button className="btn" type="submit">Add document record</button>
        </form>
      </div>
      {profile === null && !loading && <p className="muted">No business profile saved yet — fill in the form above.</p>}
    </div>
  );
}
