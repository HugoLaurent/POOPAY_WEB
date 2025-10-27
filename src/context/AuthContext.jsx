// src/context/AuthContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Auth } from "@/api"; // doit exposer: me(token), logout()
import { applyTheme } from "@/utils/theme";

const AuthContext = createContext(null);
const TOKEN_KEY = "access_token";

// Helpers token --------------------------
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}
function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

// Accepte { token, user } OU { data: { token, user } }
function pickAuthPayload(payload) {
  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  return {
    token: typeof data?.token === "string" ? data.token : null,
    user: typeof data?.user === "object" ? data.user : null,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(readToken()));
  const [error, setError] = useState("");

  // Appliquer le thème si présent côté user
  useEffect(() => {
    if (user?.theme) applyTheme(user.theme);
  }, [user?.theme]);

  // Bootstrap / vérifier le token
  useEffect(() => {
    let stop = false;

    async function bootstrap() {
      if (!token) {
        setUser(null);
        setLoading(false);
        setError("");
        return;
      }
      setLoading(true);
      setError("");

      try {
        const me = await Auth.me(token); // ton API reçoit le token
        if (stop) return;
        const { token: nextToken, user: nextUser } = pickAuthPayload(me);
        if (nextToken && nextToken !== token) {
          writeToken(nextToken);
          setToken(nextToken);
        }
        setUser(nextUser ?? null);
        setLoading(false);
      } catch (e) {
        if (stop) return;
        setError(e?.message || "Unauthorized");
        setUser(null);
        writeToken(null);
        setToken(null);
        setLoading(false);
      }
    }

    bootstrap();
    return () => {
      stop = true;
    };
  }, [token]);

  // API publique du contexte --------------------------
  const login = useCallback((payload = {}) => {
    const { token: nextToken, user: nextUser } = pickAuthPayload(payload);

    if (nextToken) {
      writeToken(nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      setUser(nextUser);
    }
    setError("");
    setLoading(false);
  }, []);

  const logout = useCallback(async ({ notifyServer = true } = {}) => {
    if (notifyServer) {
      try {
        await Auth.logout();
      } catch (e) {
        // on ne bloque pas la déconnexion cliente
        console.warn("Logout serveur échoué:", e);
      }
    }
    writeToken(null);
    setToken(null);
    setUser(null);
    setError("");
    setLoading(false);
    applyTheme("system");
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    setError("");
    try {
      const me = await Auth.me(token);
      const { token: nextToken, user: nextUser } = pickAuthPayload(me);
      if (nextToken && nextToken !== token) {
        writeToken(nextToken);
        setToken(nextToken);
      }
      setUser(nextUser ?? null);
      setLoading(false);
      return nextUser ?? null;
    } catch (e) {
      setError(e?.message || "Unauthorized");
      writeToken(null);
      setToken(null);
      setUser(null);
      setLoading(false);
      return null;
    }
  }, [token]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (typeof patch === "function") return patch(prev) ?? prev;
      if (patch && typeof patch === "object") return { ...prev, ...patch };
      return prev;
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      login,
      logout,
      refresh,
      updateUser,
    }),
    [token, user, loading, error, login, logout, refresh, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}
