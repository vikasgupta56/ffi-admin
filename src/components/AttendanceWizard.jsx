import { useMemo, useState } from 'react';
import { api } from '../api';
import { ErrorBox, Modal } from './ui';

const STEPS = ['Take attendance', 'Confirm present', 'Confirm absent', 'E-certificates'];

export default function AttendanceWizard({ event, participants, onDone }) {
  // by default everyone is present; if a list was saved earlier, restore it
  const [present, setPresent] = useState(() => new Set(participants.filter((p) => p.attendance !== 'absent').map((p) => p.id)));
  const [step, setStep] = useState(event.attendanceSaved ? 4 : 1);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState(null);

  const presentList = useMemo(() => participants.filter((p) => present.has(p.id)), [participants, present]);
  const absentList = useMemo(() => participants.filter((p) => !present.has(p.id)), [participants, present]);
  const shown = participants.filter((p) => !q || `${p.fullName} ${p.email} ${p.phone}`.toLowerCase().includes(q.toLowerCase()));

  const toggle = (id) => setPresent((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function saveAttendance() {
    setBusy(true);
    setError('');
    try {
      await api(`/admin/events/${event.id}/attendance`, { method: 'POST', body: { presentIds: [...present] } });
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const r = await api(`/admin/events/${event.id}/certificates`, { method: 'POST', body: { confirm: true } });
      setResult(r);
      setConfirm(false);
    } catch (e) {
      setError(e.message);
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  if (participants.length === 0) return <div className="empty">Nobody registered for this event, so there is nothing to mark.</div>;

  if (result)
    return (
      <div className="done-card">
        <div className="done-icon">✓</div>
        <h2>E-certificates generated</h2>
        <p><strong>{result.presentCount}</strong> present participants now have their e-certificate in their dashboard.</p>
        <p className="muted">
          {result.mailEnabled
            ? `${result.emailed} email${result.emailed === 1 ? '' : 's'} sent with the certificate attached.`
            : 'Email is not configured on the server (SMTP), so no emails were sent — participants can download their certificate from their dashboard.'}
        </p>
        <button className="btn primary" onClick={onDone}>Done</button>
      </div>
    );

  return (
    <div className="wizard">
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={step === i + 1 ? 'on' : step > i + 1 ? 'done' : ''}><span>{step > i + 1 ? '✓' : i + 1}</span>{s}</li>
        ))}
      </ol>
      <ErrorBox error={error} />

      {step === 1 && (
        <>
          <div className="wiz-bar">
            <p><strong>{present.size}</strong> of {participants.length} marked present — untick anyone who did not attend.</p>
            <div className="actions">
              <input className="search" placeholder="Search participants…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn small" onClick={() => setPresent(new Set(participants.map((p) => p.id)))}>Select all</button>
              <button className="btn small" onClick={() => setPresent(new Set())}>Deselect all</button>
            </div>
          </div>
          <div className="check-list">
            {shown.map((p) => (
              <label key={p.id} className={`check-row ${present.has(p.id) ? 'on' : ''}`}>
                <input type="checkbox" checked={present.has(p.id)} onChange={() => toggle(p.id)} />
                <span className="who"><strong>{p.fullName}</strong><em>{p.email} · {p.phone}</em></span>
                <span className={`chip ${present.has(p.id) ? 'upcoming' : 'past'}`}>{present.has(p.id) ? 'Present' : 'Absent'}</span>
              </label>
            ))}
          </div>
          <div className="wiz-foot"><span /><button className="btn primary" onClick={() => setStep(2)}>Next →</button></div>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Confirm the <span className="ok-text">present</span> participants ({presentList.length})</h3>
          {presentList.length === 0 ? <div className="empty">No one is marked present.</div> : (
            <ul className="name-grid">{presentList.map((p) => <li key={p.id} className="ok"><b>{p.fullName}</b><span>{p.email}</span></li>)}</ul>
          )}
          <div className="wiz-foot"><button className="btn" onClick={() => setStep(1)}>← Back</button><button className="btn primary" onClick={() => setStep(3)}>Next →</button></div>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Confirm the <span className="bad-text">absent</span> participants ({absentList.length})</h3>
          {absentList.length === 0 ? <div className="empty">Everyone is present 🎉</div> : (
            <ul className="name-grid">{absentList.map((p) => <li key={p.id} className="bad"><b>{p.fullName}</b><span>{p.email}</span></li>)}</ul>
          )}
          <div className="wiz-foot">
            <button className="btn" onClick={() => setStep(2)}>← Back</button>
            <button className="btn primary" onClick={saveAttendance} disabled={busy}>{busy ? 'Saving…' : 'Confirm & save attendance →'}</button>
          </div>
        </>
      )}

      {step === 4 && (
        <div className="gen">
          <p className="muted">Attendance is saved. {presentList.length > 0 || event.attendanceSaved ? 'Everyone marked present will receive an e-certificate saying they were present at this event.' : ''}</p>
          <button className="btn-big-green" onClick={() => setConfirm(true)} disabled={busy}>Generate e-certificate</button>
          <button className="btn link" onClick={() => setStep(1)}>← Edit attendance</button>
        </div>
      )}

      {confirm && (
        <Modal
          title="Generate and send e-certificates?"
          onClose={() => setConfirm(false)}
          footer={<><button className="btn" onClick={() => setConfirm(false)}>Cancel</button><button className="btn success" onClick={generate} disabled={busy}>{busy ? 'Sending…' : 'Yes, generate & send'}</button></>}
        >
          <p>This sends an e-certificate to every participant marked <b>present</b> for <b>{event.name}</b>, saying they were present at this event.</p>
          <p className="muted">Attendance will be locked afterwards.</p>
        </Modal>
      )}
    </div>
  );
}
