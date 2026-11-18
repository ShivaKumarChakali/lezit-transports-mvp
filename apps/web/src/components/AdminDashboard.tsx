'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import { api } from '@/lib/auth';
import type { ApiUser, ApiVehicle } from '@/lib/api-types';

// Shared by the Super Admin and LEZIT Admin dashboards: real counts from
// GET /users and GET /vehicles, pending approval queues with approve /
// reject actions, and activate / deactivate account actions.
export default function AdminDashboard({ title, subtitle }: { title: string; subtitle: string }) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [u, v] = await Promise.all([
        api<ApiUser[]>('/users'),
        api<ApiVehicle[]>('/vehicles'),
      ]);
      setUsers(u);
      setVehicles(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy('');
    }
  }

  const owners = users.filter((u) => u.role === 'vehicle_owner');
  const drivers = users.filter((u) => u.role === 'driver');
  const pendingUsers = users.filter((u) => u.approvalStatus === 'pending');
  const pendingVehicles = vehicles.filter((v) => v.approvalStatus === 'pending');

  return (
    <div>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      <div className="grid">
        <DashboardCard title="Vehicle owners" value={loading ? '—' : String(owners.length)} note="Registration overview — pending / approved / rejected" />
        <DashboardCard title="Drivers" value={loading ? '—' : String(drivers.length)} note="Registration overview and verification status" />
        <DashboardCard title="Vehicles" value={loading ? '—' : String(vehicles.length)} note="Registration overview and document status" />
        <DashboardCard title="Pending approvals" value={loading ? '—' : String(pendingUsers.length + pendingVehicles.length)} note="Approve or reject registration requests" />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Pending user approvals</h3>
        {pendingUsers.length === 0 && <p className="muted">No users waiting for approval.</p>}
        {pendingUsers.map((u) => (
          <p key={u.id}>
            {u.name} · {u.email} · {u.role}
            {' '}
            <button className="btn" disabled={!!busy} onClick={() => void act(`approve-${u.id}`, () => api(`/users/${u.id}/approval`, { method: 'PATCH', body: JSON.stringify({ approvalStatus: 'approved' }) }))}>
              Approve
            </button>
            {' '}
            <button className="btn btn-secondary" disabled={!!busy} onClick={() => void act(`reject-${u.id}`, () => api(`/users/${u.id}/approval`, { method: 'PATCH', body: JSON.stringify({ approvalStatus: 'rejected' }) }))}>
              Reject
            </button>
          </p>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Pending vehicle approvals</h3>
        {pendingVehicles.length === 0 && <p className="muted">No vehicles waiting for approval.</p>}
        {pendingVehicles.map((v) => (
          <p key={v.id}>
            {v.registrationNumber} {v.make ? `· ${v.make} ${v.model ?? ''}` : ''}
            {' '}
            <button className="btn" disabled={!!busy} onClick={() => void act(`vapprove-${v.id}`, () => api(`/vehicles/${v.id}/approval`, { method: 'PATCH', body: JSON.stringify({ approvalStatus: 'approved' }) }))}>
              Approve
            </button>
            {' '}
            <button className="btn btn-secondary" disabled={!!busy} onClick={() => void act(`vreject-${v.id}`, () => api(`/vehicles/${v.id}/approval`, { method: 'PATCH', body: JSON.stringify({ approvalStatus: 'rejected' }) }))}>
              Reject
            </button>
          </p>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Accounts</h3>
        {users.length === 0 && <p className="muted">No accounts yet.</p>}
        {users.map((u) => (
          <p key={u.id}>
            {u.name} · {u.email} · {u.role} · {u.approvalStatus} · {u.status}
            {' '}
            <button
              className="btn btn-secondary"
              disabled={!!busy}
              onClick={() => void act(`status-${u.id}`, () =>
                api(`/users/${u.id}/status`, {
                  method: 'PATCH',
                  body: JSON.stringify({ status: u.status === 'active' ? 'inactive' : 'active' }),
                }),
              )}
            >
              {u.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}
