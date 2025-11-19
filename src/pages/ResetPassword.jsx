import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Hourglass } from "lucide-react";

import { Auth } from "@/api";
import { SEO } from "@/components";
import logo from "@/assets/logo/logoPoopay.png";

const MIN_PASSWORD_LENGTH = 12;
const SYMBOL_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'`~]/;
const UPPERCASE_REGEX = /[A-Z]/;
const DIGIT_REGEX = /\d/;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const redirectTimeout = useRef();

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const passwordValid =
    password.length >= MIN_PASSWORD_LENGTH &&
    SYMBOL_REGEX.test(password) &&
    UPPERCASE_REGEX.test(password) &&
    DIGIT_REGEX.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const canSubmit =
    Boolean(token) && passwordValid && passwordsMatch && !loading;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await Auth.resetPassword({
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setStatus({
        type: "success",
        message: "Ton mot de passe a été mis à jour. Redirection...",
      });
      redirectTimeout.current = setTimeout(
        () => navigate("/login", { replace: true }),
        1800
      );
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message ||
          "Impossible de mettre à jour le mot de passe. Vérifie que le lien n'a pas expiré.",
      });
    } finally {
      setLoading(false);
    }
  }

  const missingToken = !token;

  return (
    <>
      <SEO
        title="Nouveau mot de passe - Poopay"
        description="Definis un nouveau mot de passe pour ton compte Poopay."
        url="https://poopay.hugolaurent.fr/reset-password"
      />

      <div className="w-full max-w-md text-center text-poopay-text dark:text-poopay-text">
        <div className="mb-8">
          <img
            src={logo}
            alt="Logo Poopay"
            className="mx-auto h-24 w-24 object-contain"
          />
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-poopay-text">
            Réinitialise ton mot de passe
          </h1>
          <p className="mt-1 text-sm text-poopay-text/70">
            Choisis un mot de passe solide avec majuscule, chiffre et caractère
            spécial.
          </p>
        </div>

        <div className="rounded-3xl bg-white/90 p-6 text-left shadow-soft dark:bg-poopay-card dark:text-poopay-text">
          {missingToken ? (
            <div className="space-y-4 text-sm text-poopay-text dark:text-poopay-text">
              <p>
                Le lien de réinitialisation est invalide ou incomplet. Clique à
                nouveau sur « J&apos;ai oublié mon mot de passe » depuis
                l&apos;application pour recevoir un nouveau lien.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-poopay-active px-4 py-2 font-semibold text-white"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1 block text-sm font-semibold text-poopay-active"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Au moins 12 caractères, dont 1 majuscule, 1 chiffre, 1 symbole"
                  className="w-full rounded-2xl border border-poopay-pill/60 bg-white px-4 py-3 text-poopay-text placeholder:text-poopay-mute focus:outline-none focus:ring-2 focus:ring-poopay-active dark:border-black/10 dark:bg-poopay-card/70 dark:text-poopay-text"
                />
                <p className="mt-1 text-xs text-poopay-text/70">
                  Minimum {MIN_PASSWORD_LENGTH} caractères avec une majuscule,
                  un chiffre et un symbole (ex&nbsp;: ! ? % #).
                </p>
                {password && !passwordValid && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Ajoute une majuscule, un chiffre, un symbole et vérifie la
                    longueur.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1 block text-sm font-semibold text-poopay-active"
                >
                  Confirme le mot de passe
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Répète le mot de passe"
                  className="w-full rounded-2xl border border-poopay-pill/60 bg-white px-4 py-3 text-poopay-text placeholder:text-poopay-mute focus:outline-none focus:ring-2 focus:ring-poopay-active dark:border-black/10 dark:bg-poopay-card/70 dark:text-poopay-text"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
              </div>

              {status.message && (
                <p
                  aria-live="polite"
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-500/20 dark:text-green-100"
                      : "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-100"
                  }`}
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-3xl bg-poopay-active px-5 py-3 font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Hourglass className="animate-pulse" size={18} />
                    Mise a jour...
                  </span>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-poopay-mute">
          Rentre à tout moment sur{" "}
          <Link to="/login" className="font-semibold text-poopay-active">
            la page de connexion
          </Link>
          .
        </p>
      </div>
    </>
  );
}
