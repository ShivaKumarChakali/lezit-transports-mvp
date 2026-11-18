import DashboardCard from '@/components/DashboardCard';

export default function DriverDashboard() {
  return (
    <div>
      <h1>Driver Dashboard</h1>
      <p className="muted">Profile, driving licence, identity documents and verification status.</p>
      <div className="grid">
        <DashboardCard title="Licence" value="—" note="Driving licence information and expiry" />
        <DashboardCard title="Verification" value="Pending" note="Identity document uploads and verification status" />
        <DashboardCard title="Assigned vehicle" value="—" note="Assigned vehicle information" />
        <DashboardCard title="Today's trips" value="—" note="Phase 2: daily trip schedules and passenger lists" />
      </div>
    </div>
  );
}
