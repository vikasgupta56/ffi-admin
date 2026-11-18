import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { fmtDateTime } from '../format';
import { Empty, ErrorBox, ModeChip, PhaseChip, Spinner } from '../components/ui';

const TABS = [['all', 'All'], ['upcoming', 'Upcoming'], ['past', 'Past']];

export default function Events() {
  const nav = useNavigate();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setEvents(null);
    const t = setTimeout(() => {
      api(`/admin/events?status=${tab}${q ? `&q=${encodeURIComponent(q)}` : ''}`).then((d) => setEvents(d.events)).catch((e) => setError(e.message));
    }, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [tab, q]);

  return (
    <>
      <header className="page-head">
        <div><h1>Events</h1><p className="muted">Create events and manage participants, attendance and certificates.</p></div>
        <Link to="/events/new" className="btn primary">+ Add new event</Link>
      </header>
      <ErrorBox error={error} />
      <div className="toolbar">
        <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
        <input className="search" placeholder="Search events…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!events ? <Spinner /> : events.length === 0 ? <Empty>No events found.</Empty> : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Event</th><th>When</th><th>Place</th><th>Mode</th><th>Participants</th><th>Status</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="click" onClick={() => nav(`/events/${e.id}`)}>
                  <td><strong>{e.name}</strong></td>
                  <td>{fmtDateTime(e.startAt)}</td>
                  <td>{e.place}</td>
                  <td><ModeChip mode={e.mode} /></td>
                  <td>{e.registeredCount}{e.capacity > 0 ? ` / ${e.capacity}` : ''}</td>
                  <td><PhaseChip phase={e.phase} sent={!!e.certificatesSentAt} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
