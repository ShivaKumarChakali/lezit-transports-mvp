// Coloured status pill for approval / trip / booking / account statuses.
// Unknown values fall back to the neutral style — no status is ever hidden.
const SUCCESS = new Set(['approved', 'active', 'confirmed', 'completed', 'in_progress', 'checked_in', 'verified']);
const WARN = new Set(['pending', 'scheduled']);
const DANGER = new Set(['rejected', 'cancelled', 'inactive', 'absent']);

export default function StatusBadge({ status }: { status: string }) {
  const tone = SUCCESS.has(status) ? 'badge-success' : WARN.has(status) ? 'badge-warn' : DANGER.has(status) ? 'badge-danger' : 'badge-default';
  return <span className={`badge ${tone}`}>{status}</span>;
}
