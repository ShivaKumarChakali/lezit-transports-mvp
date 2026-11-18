// Date formatting helpers.
//
// Trip dates are CALENDAR dates, not instants: a trip entered as 11/18/2026
// is stored as midnight UTC, which `toLocaleDateString()` renders as
// 11/17/2026 in the Americas. formatDateOnly always reads the UTC calendar
// date, so a stored date renders exactly as entered, in any viewer timezone
// — including trips stored before this fix.
//
// Timestamps (createdAt, check-in/out times) are real instants and stay
// local-time formatted via formatDateTime.
export function formatDateOnly(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}
