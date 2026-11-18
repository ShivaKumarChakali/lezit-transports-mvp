import DashboardCard from '@/components/DashboardCard';

export default function OrganizationDashboard() {
  return (
    <div>
      <h1>Organization Dashboard</h1>
      <p className="muted">Organization registration, profile and contact information. Phase 1 is account access only.</p>
      <div className="grid">
        <DashboardCard title="Profile" value="—" note="Organization profile and contact information" />
        <DashboardCard title="Passengers" value="—" note="Phase 2: employee / student passenger registration" />
        <DashboardCard title="Assigned transport" value="—" note="Phase 2: assigned routes, schedules and vehicles" />
        <DashboardCard title="Attendance" value="—" note="Phase 2: passenger attendance overview" />
      </div>
    </div>
  );
}
