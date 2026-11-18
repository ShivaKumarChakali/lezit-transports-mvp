import Link from 'next/link';

const AUDIENCES = [
  { name: 'Organizations', text: 'Daily transport for your people — staff picked up on time and brought home safe, every working day.' },
  { name: 'Vehicle owners', text: 'Put your vehicle to work on fixed routes with steady daily trips and clear trip records.' },
  { name: 'Drivers', text: 'Steady daily trips on routes you know, with your licence verified and every trip recorded.' },
  { name: 'Passengers', text: 'Book your seat in advance and know exactly when and where your vehicle picks you up.' },
];

const STEPS = [
  { n: '1', title: 'Share your routes', text: 'Tell us where your people are and when they need to travel.' },
  { n: '2', title: 'We assign vehicles', text: 'Verified drivers and approved vehicles are matched to your routes.' },
  { n: '3', title: 'Seats get booked', text: 'Your people book their seats in advance — no overcrowding, no confusion.' },
  { n: '4', title: 'Trips run on time', text: 'Vehicles run to schedule and every trip and attendance is recorded.' },
];

export default function HomePage() {
  return (
    <div className="home">
      <header className="topbar home-topbar">
        <img src="/lezit-logo-removebg-preview.png" alt="LEZIT Transports" />
        <nav className="home-nav" aria-label="Sections">
          <a href="#how-it-works">How it works</a>
          <a href="#who-we-serve">Who we serve</a>
          <a href="#what-you-get">What you get</a>
        </nav>
        <span className="home-auth">
          <Link href="/login" className="btn" style={{ marginRight: 8 }}>Log in</Link>
          <Link href="/register" className="btn btn-secondary">Register</Link>
        </span>
      </header>

      <main>
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <p className="home-pill">LEZIT Transports &middot; Daily transport services</p>
              <h1>Your people, picked up on time, <span>every day.</span></h1>
              <p className="home-lede">
                LEZIT runs daily transport for organizations &mdash; verified drivers,
                well-kept vehicles, planned routes and seats booked in advance,
                so your people get to work and home safely, on time.
              </p>
              <p className="home-cta-row">
                <Link href="/register" className="btn home-cta">Get started</Link>
                <Link href="/login" className="btn btn-outline">Log in</Link>
              </p>
              <p className="home-trust">Verified drivers &middot; Planned routes &middot; Seats booked in advance</p>
            </div>
            <div className="home-mock" aria-label="Example of a day's transport">
              <div className="home-mock-head">
                <span>Today&rsquo;s transport</span>
                <span className="badge badge-success">Running</span>
              </div>
              <div className="home-mock-row">
                <div><span className="home-mock-label">Route</span><strong>City Centre &rarr; Airport</strong></div>
                <span className="badge badge-default">08:00</span>
              </div>
              <div className="home-mock-row">
                <div><span className="home-mock-label">Vehicle</span><strong>LEZIT-101 &middot; 12 seats</strong></div>
                <span className="badge badge-success">On the road</span>
              </div>
              <div className="home-mock-row">
                <div><span className="home-mock-label">Seats</span><strong>8 seats booked</strong></div>
                <span className="badge badge-warn">Trip started</span>
              </div>
              <div className="home-mock-bar"><span style={{ width: '67%' }} /></div>
              <p className="home-mock-note">8 of 12 seats filled &middot; passengers checked in</p>
            </div>
          </div>
        </section>

        {/* Why LEZIT */}
        <section className="container home-stats" aria-label="Why LEZIT">
          <div className="card feature-card"><h3>Verified drivers</h3><p>Licences checked and vehicles approved before any trip runs.</p></div>
          <div className="card feature-card"><h3>Routes planned around you</h3><p>Pick-up points and timings set to fit your people, not the other way round.</p></div>
          <div className="card feature-card"><h3>Seats booked in advance</h3><p>Every passenger has a booked seat, so nobody is left standing.</p></div>
          <div className="card feature-card"><h3>Every trip tracked</h3><p>Trips and attendance recorded, so you always know what ran and who travelled.</p></div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container home-section">
          <p className="eyebrow">How it works</p>
          <h2>From your routes to wheels rolling, in four steps</h2>
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

        {/* Who we serve */}
        <section id="who-we-serve" className="container home-section">
          <p className="eyebrow">Who we serve</p>
          <h2>Transport that works for everyone on the road</h2>
          <div className="grid home-roles">
            {AUDIENCES.map((a) => (
              <div key={a.name} className="card feature-card">
                <h3>{a.name}</h3>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section id="what-you-get" className="home-ops">
          <div className="container home-ops-inner">
            <div>
              <p className="eyebrow">What you get</p>
              <h2>A transport service you can rely on</h2>
              <ul className="home-ops-list">
                <li><strong>On-time pick-ups</strong> &mdash; fixed routes and timings your people can plan around.</li>
                <li><strong>Seats for everyone</strong> &mdash; bookings keep every vehicle within its capacity.</li>
                <li><strong>Attendance records</strong> &mdash; know who travelled on every trip.</li>
                <li><strong>Clear reports</strong> &mdash; trips, bookings and vehicles, all in one place.</li>
              </ul>
            </div>
            <img className="home-ops-art" src="/image-removebg-preview.png" alt="Air, road, rail and sea transport" />
          </div>
        </section>

        {/* CTA */}
        <section className="container">
          <div className="home-cta-banner">
            <h2>Get your daily transport running with LEZIT</h2>
            <p>Create an account, and we will get your routes, vehicles and people moving.</p>
            <p>
              <Link href="/register" className="btn home-cta">Register now</Link>
              <Link href="/login" className="btn btn-outline-light" style={{ marginLeft: 12 }}>Log in</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container home-footer-inner">
          <span><strong>LEZIT Transports</strong> &middot; Daily transport services</span>
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
