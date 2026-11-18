import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const I = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z',
  cal: 'M7 2v3M17 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  plus: 'M12 5v14M5 12h14',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
};
export const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export default function Layout() {
  const { admin, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><img src="/logo.png" alt="" /><div><strong>For Future India</strong><span>Admin</span></div></div>
        <nav>
          <NavLink to="/" end><Icon d={I.home} /> Home</NavLink>
          <NavLink to="/events" end><Icon d={I.cal} /> Events</NavLink>
          <NavLink to="/events/new"><Icon d={I.plus} /> Add new event</NavLink>
          <div className="nav-label">Website content</div>
          <NavLink to="/awards"><Icon d={I.award} /> Awards</NavLink>
          <NavLink to="/articles"><Icon d={I.doc} /> Articles</NavLink>
          <NavLink to="/volunteers"><Icon d={I.users} /> Volunteers</NavLink>
        </nav>
        <div className="side-foot">
          <div className="me"><div className="avatar">{admin.name?.[0] || 'A'}</div><div><strong>{admin.name}</strong><span>{admin.email}</span></div></div>
          <button className="btn ghost-light" onClick={() => { logout(); nav('/login'); }}><Icon d={I.out} /> Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
