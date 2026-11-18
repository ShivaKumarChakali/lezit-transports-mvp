import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <header className="topbar">
        <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
        <span style={{ marginLeft: 'auto' }}>
          <Link href="/login" className="btn" style={{ marginRight: 8 }}>Log in</Link>
          <Link href="/register" className="btn btn-secondary">Register</Link>
        </span>
      </header>
      <main className="container">
        <section className="hero">
          <div style={{ flex: 1, minWidth: 260 }}>
            <p className="eyebrow">Transportation Management System</p>
            <h1>LEZIT Transports</h1>
            <p style={{ color: '#eadfb8' }}>
              One platform to register vehicle owners, manage drivers and vehicles,
              create routes, schedule trips, allocate passengers and monitor daily
              transportation operations.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link href="/login" className="btn">Go to your dashboard</Link>
            </p>
          </div>
          <img className="hero-art" src="/image-removebg-preview.png" alt="Air, road, rail and sea transport" />
        </section>
        <div className="grid" style={{ marginTop: 20 }}>
          <div className="card feature-card"><h3>Vehicle owners</h3><p>Register, upload documents and track approval status.</p></div>
          <div className="card feature-card"><h3>Drivers &amp; vehicles</h3><p>Licences, vehicle records and verification in one place.</p></div>
          <div className="card feature-card"><h3>Routes &amp; trips</h3><p>Phase 2: routes, schedules, bookings and attendance.</p></div>
        </div>
      </main>
    </div>
  );
}
