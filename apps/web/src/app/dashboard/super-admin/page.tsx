import DashboardCard from '@/components/DashboardCard';

export default function SuperAdminDashboard() {
  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <p className="muted">Platform overview, accounts, roles and approvals. Phase 1 shows registration data; operations overview arrives in Phase 2.</p>
      <div className="grid">
        <DashboardCard title="Vehicle owners" value="—" note="Registration overview — pending / approved / rejected" />
        <DashboardCard title="Drivers" value="—" note="Registration overview and verification status" />
        <DashboardCard title="Vehicles" value="—" note="Registration overview and document status" />
        <DashboardCard title="Pending approvals" value="—" note="Approve or reject registration requests" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Phase 1 TODO</h3>
        <p>Wire these cards to GET /api/users and GET /api/vehicles, add activate / deactivate account actions, and role &amp; permission management.</p>
      </div>
    </div>
  );
}
