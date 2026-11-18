import DashboardCard from '@/components/DashboardCard';

export default function PassengerDashboard() {
  return (
    <div>
      <h1>Passenger Dashboard</h1>
      <p className="muted">Passenger registration, profile and contact details. Phase 1 is account access only.</p>
      <div className="grid">
        <DashboardCard title="My transport" value="—" note="Phase 2: assigned vehicle, driver, route and schedule" />
        <DashboardCard title="Pickup &amp; drop" value="—" note="Phase 2: pickup and drop locations" />
        <DashboardCard title="Booking status" value="—" note="Phase 2: booking status and trip history" />
        <DashboardCard title="Attendance" value="—" note="Phase 2: basic attendance history" />
      </div>
    </div>
  );
}
