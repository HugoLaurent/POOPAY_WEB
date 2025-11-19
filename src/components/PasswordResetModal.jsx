import { useEffect, useMemo, useState } from "react";

import { Auth } from "@/api";

import SimpleModal from "./SimpleModal.jsx";

function resolveResetUrl() {
  const envUrl = import.meta?.env?.VITE_PASSWORD_RESET_URL;
  if (envUrl && typeof envUrl === "string") {
    return envUrl;
  }
  if (typeof window !== "undefined" && window.location) {
    return `${window.location.origin}/reset-password`;
  }
  return "";
}

export default function PasswordResetModal({
  isOpen,
  onClose,
  defaultEmail = "",
  forceEmail = "",
}) {
  const [email, setEmail] = useState(forceEmail || defaultEmail || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setEmail(forceEmail || defaultEmail || "");
    setStatus({ type: "", message: "" });
  }, [isOpen, defaultEmail, forceEmail]);

  const trimmedEmail = email.trim();
  const isEmailValid = useMemo(() => {
    if (!trimmedEmail) return false;
    if (!trimmedEmail.includes("@") || trimmedEmail.length < 5) return false;
    return true;
  }, [trimmedEmail]);

  const canSubmit = isEmailValid && !loading;
  const isEmailLocked = Boolean(forceEmail);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const payload = { email: trimmedEmail };
      const resetUrl = resolveResetUrl();
      if (resetUrl) {
        payload.redirectUrl = resetUrl;
      }
      await Auth.requestPasswordReset(payload);
      setStatus({
        type: "success",
        message:
          "Si un compte existe pour cet email, un lien de réinitialisation vient de t'être envoyé.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message ||
          "Impossible d'envoyer l'email pour le moment. Réessaie dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-t-3xl bg-white dark:bg-poopay-card"
    >
      <div className="relative space-y-5 px-5 py-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-poopay-text/70 transition hover:text-poopay-text dark:border-white/10 dark:bg-poopay-card/80"
        >
          Fermer
        </button>

        <header className="space-y-2 pr-16">
          <h2 className="text-xl font-semibold text-poopay-text">
            J&apos;ai oublié mon mot de passe
          </h2>
          <p className="text-sm text-poopay-text/70">
            {isEmailLocked
              ? "Nous allons t'envoyer un lien sécurisé directement sur ton adresse Poopay."
              : "Entre ton email pour recevoir un lien sécurisé et choisir un nouveau mot de passe."}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isEmailLocked ? (
            <div className="rounded-2xl border border-black/5 bg-poopay-card/40 px-4 py-3 text-sm text-poopay-text dark:border-white/10 dark:bg-poopay-card/70">
              Le lien sera envoyé à <span className="font-semibold">{email}</span>.
            </div>
          ) : (
            <>
              <label
                htmlFor="password-reset-email"
                className="text-sm font-medium"
              >
                Email
              </label>
              <input
                id="password-reset-email"
                type="email"
                autoComplete="email"
                placeholder="ton.email@example.com"
                value={email}
                disabled={loading}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-poopay-text placeholder:text-poopay-mute focus:outline-none focus:ring-2 focus:ring-poopay-active disabled:opacity-50 dark:border-white/10 dark:bg-poopay-card/80"
              />
            </>
          )}

          {status.message && (
            <p
              aria-live="polite"
              className={`rounded-2xl px-3 py-2 text-sm ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-100"
                  : "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-100"
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-poopay-active px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>
      </div>
    </SimpleModal>
  );
}
