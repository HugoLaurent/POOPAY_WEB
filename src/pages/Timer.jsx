import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionsFetch } from "@/api";
import { useAuthContext } from "@/context/AuthContext";

import { SEO, Toast } from "@/components";

const MINIMUM_SESSION_SECONDS = 30;

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function formatAmount(value, currency = "EUR") {
  return (value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Timer() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const hourlyRate = useMemo(
    () =>
      Number.isFinite(Number(user?.hourlyRate)) ? Number(user.hourlyRate) : 12,
    [user?.hourlyRate]
  );
  const currency = user?.currency ?? "EUR";
  const ratePerSecond = useMemo(() => hourlyRate / 3600, [hourlyRate]);

  const [status, setStatus] = useState("idle"); // idle | running | paused
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "success",
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (status !== "running" || startTimestamp == null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000))
      );
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, startTimestamp]);

  const resetTimer = () => {
    setStatus("idle");
    setElapsedSeconds(0);
    setStartTimestamp(null);
  };

  const handleStart = () => {
    setError("");
    setToast((prev) => ({ ...prev, isOpen: false }));
    setElapsedSeconds(0);
    setStartTimestamp(Date.now());
    setStatus("running");
  };

  const handlePause = () => {
    if (status !== "running") return;
    setStatus("paused");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedSeconds((prev) =>
      Math.max(prev, Math.floor((Date.now() - startTimestamp) / 1000))
    );
  };

  const handleResume = () => {
    if (status !== "paused") return;
    setError("");
    setToast((prev) => ({ ...prev, isOpen: false }));
    setStartTimestamp(Date.now() - elapsedSeconds * 1000);
    setStatus("running");
  };

  const handleCancel = () => {
    resetTimer();
    setError("");
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  const handleStop = async () => {
    if (startTimestamp == null) return;

    if (status === "running") {
      handlePause();
    }

    const finalElapsed = Math.max(
      elapsedSeconds,
      Math.floor((Date.now() - startTimestamp) / 1000)
    );

    if (
      !Number.isFinite(finalElapsed) ||
      finalElapsed < MINIMUM_SESSION_SECONDS
    ) {
      setError(
        "Session trop courte pour être enregistrée (minimum 30 secondes)."
      );
      resetTimer();
      return;
    }

    setSaving(true);
    setError("");
    try {
      const startISO = new Date(startTimestamp).toISOString();
      const endISO = new Date().toISOString();
      await SessionsFetch.createSession({
        startTime: startISO,
        endTime: endISO,
        durationSeconds: finalElapsed,
      });

      const earned = finalElapsed * ratePerSecond;
      const successMessage = `Session de ${formatTime(
        finalElapsed
      )} enregistrée : ${formatAmount(earned, currency)} gagnés.`;
      setToast({
        isOpen: true,
        message: successMessage,
        variant: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 800);
      resetTimer();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Impossible d'enregistrer la session.");
    } finally {
      setSaving(false);
    }
  };

  const formattedTime = formatTime(elapsedSeconds);
  const estimatedAmount = formatAmount(
    elapsedSeconds * ratePerSecond,
    currency
  );
  const isRunning = status === "running";
  const isPaused = status === "paused";

  return (
    <>
      <SEO
        title="Minuteur de session – Poopay"
        description="Lance, mets en pause et enregistre tes sessions Poopay en temps réel pour suivre précisément ton temps et ton équivalent salaire."
        url="https://poopay.hugolaurent.fr/timer"
      />

      <div className="min-h-[calc(100vh-64px)] bg-poopay-bg px-4 pb-32 sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-8">
          <section className="rounded-3xl bg-poopay-card px-6 py-8 text-center shadow-soft sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-poopay-mute">
              Session en cours
            </p>
            <div className="mt-4 text-4xl font-extrabold tabular-nums text-poopay-text sm:text-5xl">
              {formattedTime}
            </div>
            <p className="mt-3 text-sm text-poopay-text/70">
              Estimation : {estimatedAmount}
            </p>
            <p className="mt-1 text-xs text-poopay-text/60">
              Taux horaire pris en compte : {formatAmount(hourlyRate, currency)}{" "}
              / h
            </p>
          </section>

          <section className="rounded-3xl bg-poopay-card px-6 py-6 shadow-soft sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-poopay-text sm:text-lg">
                Contrôle du minuteur
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-poopay-text/60">
                {isRunning ? "En cours" : isPaused ? "En pause" : "Prêt"}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {status === "idle" && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full rounded-xl bg-poopay-active px-4 py-3 text-sm font-semibold text-white shadow transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Commencer une session
                </button>
              )}

              {isRunning && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    disabled={saving}
                    className="w-full rounded-xl bg-poopay-text/10 px-4 py-3 text-sm font-semibold text-poopay-text shadow transition hover:bg-poopay-text/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mettre en pause
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={saving}
                    className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Terminer et enregistrer
                  </button>
                </>
              )}

              {isPaused && (
                <>
                  <button
                    type="button"
                    onClick={handleResume}
                    disabled={saving}
                    className="w-full rounded-xl bg-poopay-active px-4 py-3 text-sm font-semibold text-white shadow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reprendre
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={saving}
                    className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Terminer et enregistrer
                  </button>
                </>
              )}
            </div>

            {(isRunning || isPaused) && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler la session
              </button>
            )}

            <p className="mt-4 text-xs text-poopay-text/60">
              Les sessions sauvegardées sont visibles dans l’onglet “Mes
              sessions” des réglages.
            </p>
          </section>

          {error && (
            <div
              role="status"
              className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}
        </div>

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </>
  );
}
