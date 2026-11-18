import { useState } from 'react';
import { toLocalInput } from '../format';
import { ErrorBox } from './ui';

/** Used for "Add new event" and "Edit event". `initial` is an event DTO (or undefined). */
export default function EventForm({ initial, onSubmit, submitLabel = 'Save event', onCancel }) {
  const [f, setF] = useState({
    name: initial?.name || '',
    place: initial?.place || '',
    mode: initial?.mode || 'offline',
    meetingLink: initial?.meetingLink || '',
    requirements: initial?.requirements || '',
    description: initial?.description || '',
    startAt: toLocalInput(initial?.startAt),
    endAt: toLocalInput(initial?.endAt),
    capacity: initial?.capacity ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit({
        ...f,
        startAt: new Date(f.startAt).toISOString(),
        endAt: new Date(f.endAt).toISOString(),
        capacity: Number(f.capacity) || 0,
        meetingLink: f.mode === 'online' ? f.meetingLink : '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <ErrorBox error={error} />
      <label>Event name<input required value={f.name} onChange={set('name')} placeholder="e.g. Weekend Beach Cleanup – Uttan" /></label>
      <div className="row2">
        <label>Place / venue<input required value={f.place} onChange={set('place')} placeholder={f.mode === 'online' ? 'e.g. Google Meet' : 'e.g. Uttan Beach, Mira-Bhayandar'} /></label>
        <fieldset className="seg">
          <legend>Mode</legend>
          {['offline', 'online'].map((m) => (
            <label key={m} className={f.mode === m ? 'on' : ''}><input type="radio" name="mode" checked={f.mode === m} onChange={() => setF({ ...f, mode: m })} />{m === 'online' ? 'Online' : 'Offline'}</label>
          ))}
        </fieldset>
      </div>
      {f.mode === 'online' && <label>Meeting link<input required type="url" value={f.meetingLink} onChange={set('meetingLink')} placeholder="https://meet.google.com/…" /><small>Only shown to registered participants.</small></label>}
      <div className="row3">
        <label>Starts<input required type="datetime-local" value={f.startAt} onChange={set('startAt')} /></label>
        <label>Ends<input required type="datetime-local" value={f.endAt} onChange={set('endAt')} /></label>
        <label>Capacity<input type="number" min="0" value={f.capacity} onChange={set('capacity')} /><small>0 = unlimited</small></label>
      </div>
      <label>Any specific requirement<textarea rows="3" value={f.requirements} onChange={set('requirements')} placeholder="e.g. Wear closed shoes, carry a water bottle…" /></label>
      <label>Description<textarea rows="4" value={f.description} onChange={set('description')} placeholder="What will happen at this event?" /></label>
      <div className="form-actions">
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
