import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { age, fmtDate, fmtDateTime, genderLabel } from '../format';
import AttendanceWizard from '../components/AttendanceWizard';
import EventForm from '../components/EventForm';
import { Empty, ErrorBox, Modal, ModeChip, PhaseChip, Spinner } from '../components/ui';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [parts, setParts] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const [e, p] = await Promise.all([api(`/admin/events/${id}`), api(`/admin/events/${id}/participants`)]);
      setData(e);
      setParts(p.participants);
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  // live participants: refresh every 10 s while the event is not over
  useEffect(() => {
    if (!data || data.event.phase === 'past') return undefined;
    const t = setInterval(() => { load(); setTick((n) => n + 1); }, 10000);
    return () => clearInterval(t);
  }, [data, load]);

  if (error && !data) return <><Link to="/events" className="crumb">← Events</Link><ErrorBox error={error} /></>;
  if (!data || !parts) return <Spinner />;
  const { event: ev, stats } = data;
  const shown = parts.filter((p) => !q || `${p.fullName} ${p.email} ${p.phone} ${p.city || ''}`.toLowerCase().includes(q.toLowerCase()));
  const isPast = ev.phase === 'past';

  return (
    <>
      <header className="page-head">
        <div>
          <Link to="/events" className="crumb">← Events</Link>
          <h1>{ev.name}</h1>
          <div className="chips"><PhaseChip phase={ev.phase} sent={!!ev.certificatesSentAt} /><ModeChip mode={ev.mode} /></div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setEdit(true)}>Edit</button>
          <button className="btn danger" onClick={() => setDel(true)}>Delete</button>
        </div>
      </header>
      <ErrorBox error={error} />

      <section className="card pad details">
        <dl>
          <div><dt>Starts</dt><dd>{fmtDateTime(ev.startAt)}</dd></div>
          <div><dt>Ends</dt><dd>{fmtDateTime(ev.endAt)}</dd></div>
          <div><dt>{ev.mode === 'online' ? 'Platform' : 'Place'}</dt><dd>{ev.place}</dd></div>
          {ev.mode === 'online' && <div><dt>Meeting link</dt><dd><a href={ev.meetingLink} target="_blank" rel="noreferrer">{ev.meetingLink}</a></dd></div>}
          <div><dt>Capacity</dt><dd>{ev.capacity > 0 ? `${ev.capacity} seats` : 'Unlimited'}</dd></div>
          <div className="wide"><dt>Specific requirements</dt><dd>{ev.requirements || '—'}</dd></div>
          {ev.description && <div className="wide"><dt>Description</dt><dd>{ev.description}</dd></div>}
        </dl>
      </section>

      <section className="stats small">
        <div className="stat navy"><span>Registered</span><strong>{stats.registered}</strong></div>
        <div className="stat"><span>Revoked</span><strong>{stats.revoked}</strong></div>
        <div className="stat"><span>Present</span><strong>{isPast ? stats.present : '—'}</strong></div>
        <div className="stat"><span>Certificates</span><strong>{stats.certificates}</strong></div>
      </section>

      {isPast && !ev.certificatesSentAt && (
        <section className="card pad">
          <div className="card-head"><h3>Attendance &amp; e-certificates</h3></div>
          <AttendanceWizard key={`${ev.id}-${ev.attendanceSaved}`} event={ev} participants={parts} onDone={load} />
        </section>
      )}
      {isPast && ev.certificatesSentAt && (
        <div className="alert ok">✓ E-certificates were generated on {fmtDateTime(ev.certificatesSentAt)} for {stats.present} present participant{stats.present === 1 ? '' : 's'}. Attendance is locked.</div>
      )}

      <section className="card">
        <div className="card-head">
          <h3>{isPast ? 'Participants' : 'Live participants'} <span className="badge">{parts.length}</span> {!isPast && <span className="live" title={`refreshed ${tick} times`}>● live</span>}</h3>
          <input className="search" placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {parts.length === 0 ? <Empty>No one has registered yet.</Empty> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th>{isPast && <th>Attendance</th>}<th /></tr></thead>
              <tbody>
                {shown.map((p) => (
                  <Fragment key={p.id}>
                    <tr className="click" onClick={() => setOpen(open === p.id ? null : p.id)}>
                      <td><strong>{p.fullName}</strong></td><td>{p.email}</td><td>{p.phone}</td><td>{fmtDate(p.registeredAt)}</td>
                      {isPast && <td><span className={`chip ${p.attendance === 'present' ? 'upcoming' : p.attendance === 'absent' ? 'bad' : 'past'}`}>{p.attendance === 'pending' ? 'Not marked' : p.attendance}</span></td>}
                      <td className="chev">{open === p.id ? '▲' : '▼'}</td>
                    </tr>
                    {open === p.id && (
                      <tr className="expand"><td colSpan={isPast ? 6 : 5}>
                        <dl className="mini">
                          <div><dt>Date of birth</dt><dd>{fmtDate(p.dob)} ({age(p.dob)} yrs)</dd></div>
                          <div><dt>Gender</dt><dd>{genderLabel(p.gender)}</dd></div>
                          <div><dt>City</dt><dd>{p.city || '—'}</dd></div>
                          <div><dt>College / organisation</dt><dd>{p.organisation || '—'}</dd></div>
                          <div><dt>Emergency contact</dt><dd>{p.emergencyContact || '—'}</dd></div>
                          <div className="wide"><dt>Skills</dt><dd>{p.skills?.length ? p.skills.map((s) => <span key={s} className="tag">{s}</span>) : '—'}</dd></div>
                          {p.notes && <div className="wide"><dt>Notes</dt><dd>{p.notes}</dd></div>}
                        </dl>
                      </td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {edit && (
        <Modal title="Edit event" wide onClose={() => setEdit(false)}>
          <EventForm initial={ev} submitLabel="Save changes" onCancel={() => setEdit(false)} onSubmit={async (body) => { await api(`/admin/events/${ev.id}`, { method: 'PUT', body }); setEdit(false); load(); }} />
        </Modal>
      )}
      {del && (
        <Modal title="Delete this event?" onClose={() => setDel(false)} footer={<><button className="btn" onClick={() => setDel(false)}>Cancel</button><button className="btn danger solid" onClick={async () => { try { await api(`/admin/events/${ev.id}`, { method: 'DELETE' }); nav('/events'); } catch (e) { setDel(false); setError(e.message); } }}>Delete</button></>}>
          <p>“{ev.name}” will be removed permanently. Events that already have participants cannot be deleted.</p>
        </Modal>
      )}
    </>
  );
}
