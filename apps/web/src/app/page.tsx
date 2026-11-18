import Link from 'next/link';

const ROLES = [
  { name: 'Super Admin', text: 'Full control: approve users and vehicles, manage every account and see the whole operation.' },
  { name: 'LEZIT Admin', text: 'Run the day to day: approvals, routes, schedules, bookings, trips and reports.' },
  { name: 'Vehicle Owner', text: 'Register vehicles, upload documents, track approval and follow your schedules and trips.' },
  { name: 'Driver', text: 'Keep your licence verified, see your trips, start them and check passengers in and out.' },
  { name: 'Organization', text: 'Manage your profile and follow the routes and schedules that serve your people.' },
  { name: 'Passenger', text: 'See your bookings and attendance, and know exactly when and where your trip runs.' },
];

const STEPS = [
  { n: '1', title: 'Register', text: 'Owners, drivers, organizations and passengers sign up in minutes.' },
  { n: '2', title: 'Get approved', text: 'An admin reviews every account, vehicle and document before it goes live.' },
  { n: '3', title: 'Plan routes', text: 'Admins create routes and schedules, and assign approved vehicles.' },
  { n: '4', title: 'Run trips', text: 'Bookings fill seats, drivers start trips and check passengers in.' },
];

export default function HomePage() {
  return (
    <div className="home">
      <header className="topbar home-topbar">
        <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
        <nav className="home-nav" aria-label="Sections">
          <a href="#how-it-works">How it works</a>
          <a href="#roles">Roles</a>
          <a href="#operations">Operations</a>
        </nav>
        <span style={{ marginLeft: 'auto' }}>
          <Link href="/login" className="btn" style={{ marginRight: 8 }}>Log in</Link>
          <Link href="/register" className="btn btn-secondary">Register</Link>
        </span>
      </header>

      <main>
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <p className="home-pill">Live now &middot; routes, schedules, bookings &amp; trips</p>
              <h1>Every vehicle.<br />Every trip.<br /><span>One platform.</span></h1>
              <p className="home-lede">
                LEZIT Transports brings vehicle owners, drivers, organizations and
                passengers together &mdash; register, get approved, plan routes and
                run daily trips from a single dashboard.
              </p>
              <p className="home-cta-row">
                <Link href="/login" className="btn home-cta">Go to your dashboard</Link>
                <Link href="/register" className="btn btn-outline">Register an account</Link>
              </p>
              <p className="home-trust">6 role dashboards &middot; approvals built in &middot; no app to install</p>
            </div>
            <div className="home-mock" aria-label="Preview of daily operations">
              <div className="home-mock-head">
                <span>Today&rsquo;s operations</span>
                <span className="badge badge-success">Live</span>
              </div>
              <div className="home-mock-row">
                <div><span className="home-mock-label">Route</span><strong>City Centre &rarr; Airport</strong></div>
                <span className="badge badge-default">08:00</span>
              </div>
              <div className="home-mock-row">
                <div><span className="home-mock-label">Vehicle</span><strong>LEZIT-101 &middot; 12 seats</strong></div>
                <span className="badge badge-success">Approved</span>
              </div>
              <div className="home-mock-row">
                <div><span className="home-mock-label">Booking</span><strong>8 seats booked</strong></div>
                <span className="badge badge-warn">Trip started</span>
              </div>
              <div className="home-mock-bar"><span style={{ width: '67%' }} /></div>
              <p className="home-mock-note">8 of 12 seats filled &middot; passengers checked in</p>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="container home-stats" aria-label="What the platform covers">
          <div className="card stat-card"><h3>Role dashboards</h3><p className="stat-value">6</p><p>One dashboard per role, each seeing only what it needs.</p></div>
          <div className="card stat-card"><h3>Steps to a trip</h3><p className="stat-value">4</p><p>Register, approve, plan the route, run the trip.</p></div>
          <div className="card stat-card"><h3>Operations</h3><p className="stat-value">Live</p><p>Routes, schedules, bookings, trips and attendance.</p></div>
          <div className="card stat-card"><h3>Approvals</h3><p className="stat-value">Built in</p><p>Every account and vehicle is reviewed before it goes live.</p></div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container home-section">
          <p className="eyebrow">How it works</p>
          <h2>From sign-up to wheels rolling, in four steps</h2>
          <div className="home-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="card home-step">
                <span className="home-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="container home-section">
          <p className="eyebrow">Who it is for</p>
          <h2>One platform, a dashboard for every role</h2>
          <div className="grid home-roles">
            {ROLES.map((r) => (
              <div key={r.name} className="card feature-card">
                <h3>{r.name}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Operations */}
        <section id="operations" className="home-ops">
          <div className="container home-ops-inner">
            <div>
              <p className="eyebrow">Daily operations</p>
              <h2>Everything a transport day needs</h2>
              <ul className="home-ops-list">
                <li><strong>Routes &amp; schedules</strong> &mdash; plan where vehicles run and when.</li>
                <li><strong>Bookings</strong> &mdash; fill seats with capacity checked automatically.</li>
                <li><strong>Trips &amp; attendance</strong> &mdash; drivers start trips and check passengers in.</li>
                <li><strong>Reports</strong> &mdash; users, vehicles, bookings and trips at a glance.</li>
              </ul>
            </div>
            <img className="home-ops-art" src="/image-removebg-preview.png" alt="Air, road, rail and sea transport" />
          </div>
        </section>

        {/* CTA */}
        <section className="container">
          <div className="home-cta-banner">
            <h2>Ready to run your transport operations?</h2>
            <p>Create an account, get approved, and start planning routes today.</p>
            <p>
              <Link href="/register" className="btn home-cta">Register now</Link>
              <Link href="/login" className="btn btn-outline-light" style={{ marginLeft: 12 }}>Log in</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container home-footer-inner">
          <span><strong>LEZIT Transports</strong> &middot; Transportation Management System</span>
          <span>
            <Link href="/login">Log in</Link>
            {' · '}
            <Link href="/register">Register</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
