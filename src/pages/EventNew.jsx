import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import EventForm from '../components/EventForm';

export default function EventNew() {
  const nav = useNavigate();
  return (
    <>
      <header className="page-head">
        <div><Link to="/events" className="crumb">← Events</Link><h1>Add a new event</h1><p className="muted">Fill in the details — it appears on the website instantly.</p></div>
      </header>
      <div className="card pad narrow">
        <EventForm submitLabel="Create event" onCancel={() => nav('/events')} onSubmit={async (body) => {
          const d = await api('/admin/events', { method: 'POST', body });
          nav(`/events/${d.event.id}`);
        }} />
      </div>
    </>
  );
}
