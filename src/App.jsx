import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Events from './pages/Events';
import EventNew from './pages/EventNew';
import EventDetail from './pages/EventDetail';
import ContentManager from './pages/ContentManager';

function Protected({ children }) {
  const { admin, ready } = useAuth();
  if (!ready) return <div className="center-screen"><div className="spinner" /></div>;
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/new" element={<EventNew />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="awards" element={<ContentManager kind="awards" />} />
        <Route path="articles" element={<ContentManager kind="articles" />} />
        <Route path="volunteers" element={<ContentManager kind="volunteers" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
