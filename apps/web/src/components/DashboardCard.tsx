export default function DashboardCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#111111' }}>{value}</p>
      <p>{note}</p>
    </div>
  );
}
