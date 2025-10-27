import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth
 * - Assure la redirection si l'utilisateur n'est pas authentifie
 * - Expose l'etat d'auth issu du contexte
 */
export function useAuth({ redirectTo = "/login", verify = true } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useAuthContext();

  useEffect(() => {
    if (!verify) return;
    if (context.loading) return;
    if (context.token) return;

    if (redirectTo && location.pathname !== "/login") {
      navigate(redirectTo, { replace: true, state: { from: location } });
    }
  }, [verify, context.loading, context.token, navigate, redirectTo, location]);

  return {
    token: context.token,
    user: context.user,
    loading: context.loading,
    error: context.error,
    refresh: context.refresh,
    login: context.login,
    logout: context.logout,
    updateUser: context.updateUser,
    isAuthenticated: Boolean(context.token && context.user),
  };
}
