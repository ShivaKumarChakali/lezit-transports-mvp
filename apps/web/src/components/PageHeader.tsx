export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
    </div>
  );
}
