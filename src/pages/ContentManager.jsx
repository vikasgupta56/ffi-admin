import { useEffect, useState } from 'react';
import { api } from '../api';
import ImageField from '../components/ImageField';
import { Empty, ErrorBox, Modal, Spinner } from '../components/ui';

/** One page for Awards / Articles / Volunteers — driven by a config (fields + labels). */
export const CONFIGS = {
  awards: {
    path: '/admin/awards', folder: 'awards', title: 'Awards', singular: 'award',
    blurb: 'Shown on the website’s Awards page. Add several photos per award — they open as a carousel in the popup.',
    titleOf: (i) => i.title, subOf: (i) => i.meta, coverOf: (i) => i.images?.[0],
    fields: [
      { k: 'title', label: 'Award title', required: true, placeholder: 'e.g. Swaccha Champion Award' },
      { k: 'meta', label: 'Short line (year · place)', placeholder: 'e.g. 2024 · New Delhi' },
      { k: 'year', label: 'Year badge', placeholder: 'e.g. 2024  or  2021 – 2023' },
      { k: 'desc', label: 'Description', type: 'textarea', placeholder: 'What was it awarded for? Who presented it?' },
      { k: 'images', label: 'Photos', type: 'images', hint: 'The first photo is the cover (shown on the card and first in the popup).' },
      { k: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers show first. Same number = newest first.' },
    ],
  },
  articles: {
    path: '/admin/articles', folder: 'articles', title: 'Articles', singular: 'article',
    blurb: 'Shown on the website’s Articles page. If you add a link, a “Read article” button appears in the popup.',
    titleOf: (i) => i.title, subOf: (i) => i.meta, coverOf: (i) => i.images?.[0],
    fields: [
      { k: 'title', label: 'Article title', required: true, placeholder: 'Headline' },
      { k: 'meta', label: 'Short line (publication · date)', placeholder: 'e.g. Mid-Day · 12 Mar 2025' },
      { k: 'year', label: 'Year badge', placeholder: 'e.g. 2025' },
      { k: 'desc', label: 'Summary', type: 'textarea', placeholder: 'A short summary of the article' },
      { k: 'link', label: 'Article link (optional)', type: 'url', placeholder: 'https://…', hint: 'Leave empty to hide the “Read article” button.' },
      { k: 'images', label: 'Photos', type: 'images', hint: 'The first photo is the cover.' },
      { k: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers show first. Same number = newest first.' },
    ],
  },
  volunteers: {
    path: '/admin/volunteers', folder: 'volunteers', title: 'Volunteers', singular: 'volunteer',
    blurb: 'Shown as the “Volunteer team” on the About page.',
    titleOf: (i) => i.name, subOf: (i) => i.role, coverOf: (i) => i.img,
    fields: [
      { k: 'name', label: 'Name', required: true },
      { k: 'role', label: 'Role (optional)', placeholder: 'Volunteer' },
      { k: 'img', label: 'Photo', type: 'image' },
      { k: 'linkedin', label: 'LinkedIn profile (optional)', type: 'url', placeholder: 'https://www.linkedin.com/in/…', hint: 'The LinkedIn icon on the website only shows when this is filled.' },
      { k: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers show first.' },
    ],
  },
};

const blank = (cfg) => Object.fromEntries(cfg.fields.map((f) => [f.k, f.type === 'images' ? [] : f.type === 'number' ? 0 : f.k === 'role' ? '' : '']));

function ItemForm({ cfg, initial, onSaved, onCancel }) {
  const [f, setF] = useState(() => ({ ...blank(cfg), ...Object.fromEntries(Object.entries(initial || {}).filter(([k]) => cfg.fields.some((x) => x.k === k))) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { ...f, order: Number(f.order) || 0 };
      const d = initial ? await api(`${cfg.path}/${initial.id}`, { method: 'PUT', body }) : await api(cfg.path, { method: 'POST', body });
      onSaved(d.item);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <ErrorBox error={error} />
      {cfg.fields.map((x) =>
        x.type === 'images' || x.type === 'image' ? (
          <ImageField key={x.k} label={x.label} value={f[x.k]} onChange={(v) => set(x.k, v)} folder={cfg.folder} multiple={x.type === 'images'} hint={x.hint} />
        ) : (
          <label key={x.k}>
            {x.label}
            {x.type === 'textarea' ? (
              <textarea rows={5} value={f[x.k]} onChange={(e) => set(x.k, e.target.value)} placeholder={x.placeholder} />
            ) : (
              <input type={x.type || 'text'} required={x.required} value={f[x.k]} onChange={(e) => set(x.k, e.target.value)} placeholder={x.placeholder} />
            )}
            {x.hint && <small className="muted">{x.hint}</small>}
          </label>
        ),
      )}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : `Add ${cfg.singular}`}</button>
      </div>
    </form>
  );
}

export default function ContentManager({ kind }) {
  const cfg = CONFIGS[kind];
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [del, setDel] = useState(null);

  const load = () => api(cfg.path).then((d) => setItems(d.items)).catch((e) => setError(e.message));
  useEffect(() => { setItems(null); setEditing(null); load(); /* eslint-disable-next-line */ }, [kind]);

  async function remove() {
    try { await api(`${cfg.path}/${del.id}`, { method: 'DELETE' }); setDel(null); load(); } catch (e) { setError(e.message); setDel(null); }
  }

  return (
    <>
      <header className="page-head">
        <div><h1>{cfg.title}</h1><p className="muted">{cfg.blurb} Changes appear on the website within about a minute.</p></div>
        <button className="btn primary" onClick={() => setEditing('new')}>+ Add {cfg.singular}</button>
      </header>
      <ErrorBox error={error} />
      {!items ? <Spinner /> : items.length === 0 ? <Empty>No {cfg.title.toLowerCase()} yet. Click “Add {cfg.singular}”.</Empty> : (
        <div className="item-grid">
          {items.map((it) => (
            <article key={it.id} className="item-card">
              <div className="item-cover">{cfg.coverOf(it) ? <img src={cfg.coverOf(it)} alt="" loading="lazy" /> : <span className="muted">No photo</span>}{it.images?.length > 1 && <em>{it.images.length} photos</em>}</div>
              <div className="item-body">
                <strong>{cfg.titleOf(it)}</strong>
                {cfg.subOf(it) && <span className="muted">{cfg.subOf(it)}</span>}
                {it.link && <span className="chip">Has link</span>}
              </div>
              <div className="item-actions">
                <button className="btn" onClick={() => setEditing(it)}>Edit</button>
                <button className="btn danger" onClick={() => setDel(it)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal wide title={editing === 'new' ? `Add ${cfg.singular}` : `Edit ${cfg.singular}`} onClose={() => setEditing(null)}>
          <ItemForm cfg={cfg} initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
        </Modal>
      )}
      {del && (
        <Modal title={`Delete ${cfg.singular}?`} onClose={() => setDel(null)} footer={<><button className="btn" onClick={() => setDel(null)}>Cancel</button><button className="btn danger solid" onClick={remove}>Yes, delete</button></>}>
          <p>“{cfg.titleOf(del)}” will be removed from the website. This can’t be undone.</p>
        </Modal>
      )}
    </>
  );
}
