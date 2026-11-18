import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return setReady(true);
    api('/admin/me')
      .then((d) => setAdmin(d.admin))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, [logout]);

  const login = async (email, password) => {
    const d = await api('/admin/auth/login', { method: 'POST', body: { email, password } });
    setToken(d.token);
    setAdmin(d.admin);
  };

  return <Ctx.Provider value={{ admin, ready, login, logout }}>{children}</Ctx.Provider>;
}
