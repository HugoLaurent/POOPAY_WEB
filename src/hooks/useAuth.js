import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Auth } from '@/api';
import { applyTheme } from './useTheme';

/**
 * useAuth
 * - Verifie la presence/validite du token
 * - Redirige vers /login si manquant ou invalide
 * - Expose un etat simple pour l'UI si besoin
 */
export function useAuth({ redirectTo = '/login', verify = true } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function check() {
      const token = localStorage.getItem('access_token');

      // Pas de token => redirection immediate
      if (!token) {
        if (alive) setLoading(false);
        if (redirectTo && location.pathname !== '/login')
          navigate(redirectTo, { replace: true, state: { from: location } });
        return;
      }

      // Si on ne souhaite pas appeler /me, on s'arrete ici
      if (!verify) {
        if (alive) setLoading(false);
        return;
      }

      // Verifie la validite du token via /me
      try {
        const me = await Auth.me(token);
        if (!alive) return;
        if (me) {
          setUser(me);
          try {
            localStorage.setItem('user', JSON.stringify(me));
          } catch {}
          if (typeof me?.id !== 'undefined') {
            localStorage.setItem('user_id', String(me.id));
          }
          if (me?.username) {
            localStorage.setItem('username', me.username);
          }
          if (me?.theme) {
            applyTheme(me.theme);
          }
          setLoading(false);
        } else {
          throw new Error('Invalid token');
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Unauthorized');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        setLoading(false);
        if (redirectTo && location.pathname !== '/login')
          navigate(redirectTo, { replace: true, state: { from: location } });
      }
    }

    check();
    return () => {
      alive = false;
    };
  }, [navigate, location, redirectTo, verify]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!localStorage.getItem('access_token'),
  };
}
