'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/lib/auth';
import { formatDateOnly } from '@/lib/dates';
import type { ApiBooking, ApiRoute, ApiSchedule, ApiTrip, ApiUser, ApiVehicle } from '@/lib/api-types';

// Phase 2 operations for Super Admin / LEZIT Admin: routes, schedules,
// manual bookings, trips and basic operational reports.
export default function OperationsPanel() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [report, setReport] = useState<{
    users: { total: number };
    vehicles: { total: number };
    routes: number;
    schedules: { total: number; active: number };
    bookings: { total: number };
    trips: { total: number };
    attendance: { total: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [routeName, setRouteName] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [routeStops, setRouteStops] = useState('');
  const [schRouteId, setSchRouteId] = useState('');
  const [schVehicleId, setSchVehicleId] = useState('');
  const [schDriverId, setSchDriverId] = useState('');
  const [schTime, setSchTime] = useState('08:00');
  const [schDays, setSchDays] = useState('Mon,Tue,Wed,Thu,Fri');
  const [bookPassengerId, setBookPassengerId] = useState('');
  const [bookRouteId, setBookRouteId] = useState('');
  const [bookScheduleId, setBookScheduleId] = useState('');
  const [bookSeats, setBookSeats] = useState('1');
  const [tripRouteId, setTripRouteId] = useState('');
  const [tripScheduleId, setTripScheduleId] = useState('');
  const [tripVehicleId, setTripVehicleId] = useState('');
  const [tripDriverId, setTripDriverId] = useState('');
  const [tripDate, setTripDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [r, s, b, t, u, v, rep] = await Promise.all([
        api<ApiRoute[]>('/routes'),
        api<ApiSchedule[]>('/schedules'),
        api<ApiBooking[]>('/bookings'),
        api<ApiTrip[]>('/trips'),
        api<ApiUser[]>('/users'),
        api<ApiVehicle[]>('/vehicles'),
        api<{
          users: { total: number };
          vehicles: { total: number };
          routes: number;
          schedules: { total: number; active: number };
          bookings: { total: number };
          trips: { total: number };
          attendance: { total: number };
        }>('/reports/overview'),
      ]);
      setRoutes(r);
      setSchedules(s);
      setBookings(b);
      setTrips(t);
      setUsers(u);
      setVehicles(v);
      setReport(rep);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load operations data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(fn: () => Promise<unknown>, done: string) {
    setError('');
    setNotice('');
    try {
      await fn();
      setNotice(done);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  async function submit(e: React.FormEvent, fn: () => Promise<unknown>, done: string) {
    e.preventDefault();
    await act(fn, done);
  }

  const passengers = users.filter((u) => u.role === 'passenger');
  const drivers = users.filter((u) => u.role === 'driver');
  const confirmedSeats = bookings.filter((b) => b.status === 'confirmed').reduce((n, b) => n + b.seats, 0);

  return (
    <div>
      <h2 className="section">Operations — Phase 2</h2>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}
      <div className="grid">
        <DashboardCard title="Routes" value={loading ? '—' : String(routes.length)} note="Created routes with pickup / drop locations" />
        <DashboardCard title="Schedules" value={loading ? '—' : String(schedules.filter((s) => s.active).length)} note="Active schedules" />
        <DashboardCard title="Bookings" value={loading ? '—' : String(bookings.length)} note={`${confirmedSeats} confirmed seats`} />
        <DashboardCard title="Trips" value={loading ? '—' : String(trips.length)} note="Scheduled, in progress and completed trips" />
      </div>

      <div className="card section">
        <h3>Basic operational report</h3>
        {report ? (
          <p>
            {report.users.total} users · {report.vehicles.total} vehicles · {report.routes} routes ·{' '}
            {report.schedules.active} of {report.schedules.total} schedules active · {report.bookings.total} bookings ·{' '}
            {report.trips.total} trips · {report.attendance.total} attendance records
          </p>
        ) : (
          <p className="muted">Report unavailable.</p>
        )}
      </div>

      <div className="card section">
        <h3>Routes</h3>
        {routes.length === 0 && <p className="muted">No routes yet.</p>}
        <div className="row-list">
          {routes.map((r) => (
            <div className="row" key={r.id}>
              <span className="row-text">
                {r.name} · {r.startLocation} → {r.endLocation}
                {r.stops.length > 0 ? ` · stops: ${r.stops.join(', ')}` : ''}
              </span>
            </div>
          ))}
        </div>
        <form className="form-block"
          onSubmit={(e) =>
            void submit(e, () =>
              api('/routes', {
                method: 'POST',
                body: JSON.stringify({
                  name: routeName,
                  startLocation: routeFrom,
                  endLocation: routeTo,
                  stops: routeStops.split(',').map((s) => s.trim()).filter(Boolean),
                }),
              }),
              'Route created.',
            )
          }
        >
          <h3>Create a route</h3>
          <label className="label" htmlFor="routeName">Route name</label>
          <input id="routeName" className="input" required value={routeName} onChange={(e) => setRouteName(e.target.value)} />
          <label className="label" htmlFor="routeFrom">Start location</label>
          <input id="routeFrom" className="input" required value={routeFrom} onChange={(e) => setRouteFrom(e.target.value)} />
          <label className="label" htmlFor="routeTo">End location</label>
          <input id="routeTo" className="input" required value={routeTo} onChange={(e) => setRouteTo(e.target.value)} />
          <label className="label" htmlFor="routeStops">Stops (comma separated, optional)</label>
          <input id="routeStops" className="input" value={routeStops} onChange={(e) => setRouteStops(e.target.value)} />
          <button className="btn" type="submit">Create route</button>
        </form>
      </div>

      <div className="card section">
        <h3>Schedules</h3>
        {schedules.length === 0 && <p className="muted">No schedules yet.</p>}
        <div className="row-list">
          {schedules.map((s) => (
            <div className="row" key={s.id}>
              <span className="row-text">{s.departureTime} · {s.days.join(', ') || 'no days set'}</span>
              <StatusBadge status={s.active ? 'active' : 'inactive'} />
            </div>
          ))}
        </div>
        <form className="form-block"
          onSubmit={(e) =>
            void submit(e, () =>
              api('/schedules', {
                method: 'POST',
                body: JSON.stringify({
                  routeId: schRouteId,
                  vehicleId: schVehicleId || undefined,
                  driverId: schDriverId || undefined,
                  departureTime: schTime,
                  days: schDays.split(',').map((s) => s.trim()).filter(Boolean),
                }),
              }),
              'Schedule created.',
            )
          }
        >
          <h3>Create a schedule</h3>
          <label className="label" htmlFor="schRouteId">Route</label>
          <select id="schRouteId" className="input" required value={schRouteId} onChange={(e) => setSchRouteId(e.target.value)}>
            <option value="">Select a route…</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <label className="label" htmlFor="schVehicleId">Vehicle (optional)</label>
          <select id="schVehicleId" className="input" value={schVehicleId} onChange={(e) => setSchVehicleId(e.target.value)}>
            <option value="">No vehicle yet</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
          <label className="label" htmlFor="schDriverId">Driver (optional)</label>
          <select id="schDriverId" className="input" value={schDriverId} onChange={(e) => setSchDriverId(e.target.value)}>
            <option value="">No driver yet</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} · {d.email}</option>
            ))}
          </select>
          <label className="label" htmlFor="schTime">Departure time</label>
          <input id="schTime" className="input" type="time" required value={schTime} onChange={(e) => setSchTime(e.target.value)} />
          <label className="label" htmlFor="schDays">Days (comma separated)</label>
          <input id="schDays" className="input" value={schDays} onChange={(e) => setSchDays(e.target.value)} />
          <button className="btn" type="submit">Create schedule</button>
        </form>
      </div>

      <div className="card section">
        <h3>Manual bookings</h3>
        {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        <div className="row-list">
          {bookings.map((b) => (
            <div className="row" key={b.id}>
              <span className="row-text">{b.seats} seat(s)</span>
              <StatusBadge status={b.status} />
              {b.status === 'confirmed' && (
                <span className="row-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => void act(() =>
                      api(`/bookings/${b.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }),
                      'Booking cancelled.',
                    )}
                  >
                    Cancel
                  </button>
                </span>
              )}
            </div>
          ))}
        </div>
        <form className="form-block"
          onSubmit={(e) =>
            void submit(e, () =>
              api('/bookings', {
                method: 'POST',
                body: JSON.stringify({
                  passengerId: bookPassengerId,
                  routeId: bookRouteId,
                  scheduleId: bookScheduleId || undefined,
                  seats: Number(bookSeats),
                }),
              }),
              'Booking created.',
            )
          }
        >
          <h3>Create a manual booking</h3>
          <label className="label" htmlFor="bookPassengerId">Passenger</label>
          <select id="bookPassengerId" className="input" required value={bookPassengerId} onChange={(e) => setBookPassengerId(e.target.value)}>
            <option value="">Select a passenger…</option>
            {passengers.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.email}</option>
            ))}
          </select>
          <label className="label" htmlFor="bookRouteId">Route</label>
          <select id="bookRouteId" className="input" required value={bookRouteId} onChange={(e) => setBookRouteId(e.target.value)}>
            <option value="">Select a route…</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <label className="label" htmlFor="bookScheduleId">Schedule (optional — enables seat capacity checks)</label>
          <select id="bookScheduleId" className="input" value={bookScheduleId} onChange={(e) => setBookScheduleId(e.target.value)}>
            <option value="">No schedule</option>
            {schedules.filter((s) => !bookRouteId || s.routeId === bookRouteId).map((s) => (
              <option key={s.id} value={s.id}>{s.departureTime} · {s.days.join(', ')}</option>
            ))}
          </select>
          <label className="label" htmlFor="bookSeats">Seats</label>
          <input id="bookSeats" className="input" type="number" min={1} required value={bookSeats} onChange={(e) => setBookSeats(e.target.value)} />
          <button className="btn" type="submit">Create booking</button>
        </form>
      </div>

      <div className="card section">
        <h3>Trips</h3>
        {trips.length === 0 && <p className="muted">No trips yet.</p>}
        <div className="row-list">
          {trips.map((t) => (
            <div className="row" key={t.id}>
              <span className="row-text">{formatDateOnly(t.date)}</span>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
        <form className="form-block"
          onSubmit={(e) =>
            void submit(e, () =>
              api('/trips', {
                method: 'POST',
                body: JSON.stringify({
                  routeId: tripRouteId,
                  scheduleId: tripScheduleId || undefined,
                  vehicleId: tripVehicleId || undefined,
                  driverId: tripDriverId || undefined,
                  date: tripDate,
                }),
              }),
              'Trip created.',
            )
          }
        >
          <h3>Create a trip</h3>
          <label className="label" htmlFor="tripRouteId">Route</label>
          <select id="tripRouteId" className="input" required value={tripRouteId} onChange={(e) => setTripRouteId(e.target.value)}>
            <option value="">Select a route…</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <label className="label" htmlFor="tripScheduleId">Schedule (optional)</label>
          <select id="tripScheduleId" className="input" value={tripScheduleId} onChange={(e) => setTripScheduleId(e.target.value)}>
            <option value="">No schedule</option>
            {schedules.filter((s) => !tripRouteId || s.routeId === tripRouteId).map((s) => (
              <option key={s.id} value={s.id}>{s.departureTime} · {s.days.join(', ')}</option>
            ))}
          </select>
          <label className="label" htmlFor="tripVehicleId">Vehicle (optional)</label>
          <select id="tripVehicleId" className="input" value={tripVehicleId} onChange={(e) => setTripVehicleId(e.target.value)}>
            <option value="">No vehicle yet</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
          <label className="label" htmlFor="tripDriverId">Driver (optional)</label>
          <select id="tripDriverId" className="input" value={tripDriverId} onChange={(e) => setTripDriverId(e.target.value)}>
            <option value="">No driver yet</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} · {d.email}</option>
            ))}
          </select>
          <label className="label" htmlFor="tripDate">Date</label>
          <input id="tripDate" className="input" type="date" required value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
          <button className="btn" type="submit">Create trip</button>
        </form>
      </div>
    </div>
  );
}
