import DashboardCard from '@/components/DashboardCard';

export default function AdminDashboard() {
  return (
    <div>
      <h1>LEZIT Admin Dashboard</h1>
      <p className="muted">Vehicle owner, driver and vehicle management, verification and approval status.</p>
      <div className="grid">
        <DashboardCard title="Owners to verify" value="—" note="Owner registration and verification" />
        <DashboardCard title="Drivers to verify" value="—" note="Driver registration and licence documents" />
        <DashboardCard title="Vehicles to verify" value="—" note="Vehicle registration and documents" />
        <DashboardCard title="Approvals" value="—" note="Owner and driver approval status" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Phase 2 preview</h3>
        <p>Route creation, schedules, vehicle / driver assignment, passenger allocation, manual bookings, trips and attendance will appear here.</p>
      </div>
    </div>
  );
}
