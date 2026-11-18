import DashboardCard from '@/components/DashboardCard';

export default function OwnerDashboard() {
  return (
    <div>
      <h1>Vehicle Owner Dashboard</h1>
      <p className="muted">Profile, business documents, vehicles and drivers — and your approval status.</p>
      <div className="grid">
        <DashboardCard title="My vehicles" value="—" note="Vehicle registration and approval status" />
        <DashboardCard title="My drivers" value="—" note="Driver information and approval status" />
        <DashboardCard title="Documents" value="—" note="Identity and business document uploads" />
        <DashboardCard title="Approval status" value="Pending" note="Shown after an admin reviews your registration" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Phase 1 TODO</h3>
        <p>Add the vehicle registration form (POST /api/vehicles) and document upload metadata (POST /api/documents — storage provider still to be chosen).</p>
      </div>
    </div>
  );
}
