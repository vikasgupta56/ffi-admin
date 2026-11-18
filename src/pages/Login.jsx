import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { ErrorBox } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      nav('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <img src="/logo.png" alt="" width="96" height="96" />
        <h1>For Future India</h1>
        <p>Toward Better Nation…</p>
        <small>Admin dashboard — manage events, participants, attendance and e-certificates.</small>
      </div>
      <form className="login-card" onSubmit={submit}>
        <h2>Admin login</h2>
        <p className="muted">Sign in to continue.</p>
        <ErrorBox error={error} />
        <label>Email<input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@forfutureindia.org" /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
        <button className="btn primary block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
