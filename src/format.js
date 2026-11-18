const TZ = 'Asia/Kolkata';
export const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ });
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: TZ });
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { timeStyle: 'short', timeZone: TZ });
/** ISO -> value for <input type="datetime-local"> (browser local time) */
export const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const age = (dob) => (dob ? Math.floor((Date.now() - new Date(dob)) / 31557600000) : '—');
export const genderLabel = (g) => ({ male: 'Male', female: 'Female', other: 'Other', prefer_not_to_say: 'Prefers not to say' }[g] || '—');
