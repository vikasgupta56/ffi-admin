import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { fmtDate, fmtDateTime } from '../format';
import { Empty, ErrorBox, ModeChip, Spinner } from '../components/ui';

const Stat = ({ label, value, hint, tone }) => (
  <div className={`stat ${tone || ''}`}><span>{label}</span><strong>{value}</strong>{hint && <em>{hint}</em>}</div>
);

export default function Home() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => api('/admin/stats').then(setD).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  async function resolve(id, action) {
    try {
      await api(`/admin/email-requests/${id}/${action}`, { method: 'POST', body: {} });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (error && !d) return <ErrorBox error={error} />;
  if (!d) return <Spinner />;
  const max = Math.max(1, ...d.registrationsPerDay.map((x) => x.count));
  const hour = new Date().getHours();

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'} 👋</h1>
          <p className="muted">Here’s what’s happening with your events today.</p>
        </div>
        <Link to="/events/new" className="btn primary">+ Add new event</Link>
      </header>
      <ErrorBox error={error} />

      <section className="stats">
        <Stat label="Upcoming events" value={d.totals.upcomingEvents} hint={`${d.totals.totalEvents} events in total`} tone="navy" />
        <Stat label="Active registrations" value={d.totals.activeRegistrations} hint="across all events" tone="yellow" />
        <Stat label="Volunteers (accounts)" value={d.totals.totalUsers} hint="registered users" />
        <Stat label="E-certificates issued" value={d.totals.certificatesIssued} hint={`${d.totals.pastEvents} past events`} />
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h3>Registrations — last 7 days</h3></div>
          <div className="bars">
            {d.registrationsPerDay.map((x) => (
              <div key={x.date} className="bar-col" title={`${x.count} on ${x.date}`}>
                <span className="bar-val">{x.count}</span>
                <div className="bar" style={{ height: `${(x.count / max) * 100}%` }} />
                <span className="bar-lbl">{new Date(x.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h3>Needs your action</h3><span className="badge">{d.awaitingAction.length}</span></div>
          {d.awaitingAction.length === 0 ? <Empty>All past events are wrapped up 🎉</Empty> : (
            <ul className="list">
              {d.awaitingAction.map((e) => (
                <li key={e.id}>
                  <div><strong>{e.name}</strong><span className="muted">{fmtDate(e.startAt)} · {e.registeredCount} participants</span></div>
                  <Link className="btn small" to={`/events/${e.id}`}>{e.attendanceSaved ? 'Send certificates' : 'Take attendance'}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h3>Upcoming events</h3><Link to="/events">View all</Link></div>
          {d.upcoming.length === 0 ? <Empty>No upcoming events. <Link to="/events/new">Create one</Link></Empty> : (
            <ul className="list">
              {d.upcoming.map((e) => (
                <li key={e.id}>
                  <div>
                    <Link to={`/events/${e.id}`}><strong>{e.name}</strong></Link>
                    <span className="muted">{fmtDateTime(e.startAt)} · {e.place}</span>
                    {e.capacity > 0 && <div className="progress"><i style={{ width: `${Math.min(100, (e.registeredCount / e.capacity) * 100)}%` }} /></div>}
                  </div>
                  <div className="right"><ModeChip mode={e.mode} /><span className="muted">{e.registeredCount}{e.capacity > 0 ? ` / ${e.capacity}` : ''} joined</span></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-head"><h3>Recent registrations</h3></div>
          {d.recentRegistrations.length === 0 ? <Empty>No registrations yet.</Empty> : (
            <ul className="list">
              {d.recentRegistrations.map((r) => (
                <li key={r.id}>
                  <div><strong>{r.name}</strong><span className="muted">{r.event}</span></div>
                  <span className="muted">{fmtDateTime(r.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-head"><h3>Email-change requests</h3><span className="badge">{d.emailRequests.length}</span></div>
        {d.emailRequests.length === 0 ? <Empty>No pending requests.</Empty> : (
          <ul className="list">
            {d.emailRequests.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.userName}</strong>
                  <span className="muted">{r.currentEmail} → <b>{r.newEmail}</b></span>
                  {r.reason && <span className="muted">“{r.reason}”</span>}
                </div>
                <div className="actions">
                  <button className="btn small primary" onClick={() => resolve(r.id, 'approve')}>Approve</button>
                  <button className="btn small" onClick={() => resolve(r.id, 'reject')}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
