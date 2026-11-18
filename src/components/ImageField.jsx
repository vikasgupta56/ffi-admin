import { useRef, useState } from 'react';
import { uploadImage } from '../upload';

/** Upload (to S3/CDN) or paste URLs. `multiple` = list where the first image is the cover; otherwise a single image. */
export default function ImageField({ label, value, onChange, folder, multiple = false, hint }) {
  const list = multiple ? value || [] : value ? [value] : [];
  const set = (arr) => onChange(multiple ? arr : arr[0] || '');
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState('');
  const [url, setUrl] = useState('');
  const input = useRef();

  async function pick(files) {
    setErr('');
    const chosen = Array.from(files).slice(0, multiple ? 15 : 1);
    setBusy(chosen.length);
    const done = [];
    for (const f of chosen) {
      try {
        done.push(await uploadImage(f, folder));
      } catch (e) {
        setErr(e.message);
      }
      setBusy((b) => b - 1);
    }
    if (done.length) set(multiple ? [...list, ...done] : done);
    input.current.value = '';
  }
  const move = (i, d) => { const a = [...list]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set(a); };
  const addUrl = () => { const u = url.trim(); if (!u) return; set(multiple ? [...list, u] : [u]); setUrl(''); };

  return (
    <div className="imgfield">
      <span className="lbl">{label}</span>
      {list.length > 0 && (
        <ul className="thumbs">
          {list.map((u, i) => (
            <li key={u + i}>
              <img src={u} alt="" />
              {multiple && i === 0 && <em>Cover</em>}
              <div className="thumb-actions">
                {multiple && <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>}
                {multiple && <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move later">→</button>}
                <button type="button" className="rm" onClick={() => set(list.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="img-add">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple={multiple} hidden onChange={(e) => e.target.files.length && pick(e.target.files)} />
        <button type="button" className="btn" disabled={busy > 0} onClick={() => input.current.click()}>{busy > 0 ? `Uploading… (${busy} left)` : multiple ? '⬆ Upload images' : list.length ? '⬆ Replace image' : '⬆ Upload image'}</button>
        <span className="muted">or</span>
        <input className="url-in" placeholder="Paste an image URL" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
        <button type="button" className="btn" onClick={addUrl} disabled={!url.trim()}>Add</button>
      </div>
      {hint && <small className="muted">{hint}</small>}
      {err && <div className="alert err" role="alert">{err}</div>}
    </div>
  );
}
