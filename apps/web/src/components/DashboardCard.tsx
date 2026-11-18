export default function DashboardCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="card stat-card">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      <p>{note}</p>
    </div>
  );
}
