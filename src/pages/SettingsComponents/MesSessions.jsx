import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import SimpleModal from "../../components/SimpleModal";
import Toast from "../../components/Toast";
import { SessionsFetch } from "../../api/api";

export default function MesSessions({ isOpen, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    async function fetchSessions() {
      setLoading(true);
      setError("");
      try {
        const data = await SessionsFetch.getSessions();
        if (!cancelled) {
          setSessions(Array.isArray(data) ? data : data?.sessions || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message || "Impossible de recuperer les sessions actives."
          );
          setSessions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const hasSessions = useMemo(
    () => sessions && sessions.length > 0,
    [sessions]
  );

  function handleRequestDelete(sessionMeta) {
    if (!sessionMeta?.id) return;
    setSessionToDelete(sessionMeta);
    setDeleteError("");
  }

  function handleCancelDelete() {
    if (deleteLoading) return;
    setSessionToDelete(null);
    setDeleteError("");
  }

  async function handleConfirmDelete() {
    const sessionId = sessionToDelete?.id;
    if (!sessionId) return;

    setDeleteLoading(true);
    setDeleteError("");
    try {
      await SessionsFetch.deleteSession(sessionId);
      setSessions((prev) =>
        prev.filter(
          (s) =>
            s.id !== sessionId &&
            s.sessionId !== sessionId &&
            s.uuid !== sessionId
        )
      );
      setSessionToDelete(null);
      setToast({
        isOpen: true,
        message: "La session a été supprimée avec succès.",
        variant: "success",
      });
    } catch (err) {
      setDeleteError(
        err?.message || "Impossible de supprimer cette session pour le moment."
      );
      setToast({
        isOpen: true,
        message:
          err?.message ||
          "Impossible de supprimer cette session pour le moment.",
        variant: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  const confirmMessage = sessionToDelete?.label
    ? `Es-tu sur de vouloir supprimer la session du ${sessionToDelete.label} ?`
    : "Es-tu sur de vouloir supprimer cette session ?";

  return (
    <>
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        className="mx-auto max-w-3xl rounded-t-3xl"
      >
        <div className="p-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-poopay-text">
              Mes sessions actives
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-poopay-mute hover:text-poopay-text transition"
            >
              Fermer
            </button>
          </header>
          <p className="text-sm text-poopay-mute">
            Tes passages toilettes recents et leurs gains.
          </p>

          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8 text-sm text-poopay-mute">
              Chargement des sessions...
            </div>
          )}

          {!loading && !error && (
            <>
              {hasSessions ? (
                <ul className="max-h-[480px] space-y-3 overflow-y-auto pr-2 text-sm text-poopay-text scrollbar-poopay">
                  {sessions.map((session) => {
                    const id =
                      session?.id || session?.sessionId || session?.uuid;
                    const start = session?.startTime || session?.startedAt;
                    const end = session?.endTime || session?.endedAt;
                    const status = session?.status;
                    const durationSeconds = session?.durationSeconds;
                    const earned = session?.amountEarned;

                    const sessionDate = formatSessionDate(start);
                    const durationLabel = formatSessionDuration(
                      durationSeconds,
                      start,
                      end
                    );
                    const amountLabel = formatSessionEarnings(earned);
                    const deleteMeta = id ? { id, label: sessionDate } : null;

                    return (
                      <li
                        key={id || `${sessionDate}-${status}`}
                        className="flex items-center justify-between rounded-lg bg-poopay-card/80 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">
                            Session du {sessionDate}
                          </p>
                          <p className="text-xs text-poopay-mute">
                            {status === "ongoing"
                              ? `Session en cours depuis ${durationLabel}.`
                              : `Cette session a dure ${durationLabel} et tu as genere ${amountLabel}.`}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            deleteMeta && handleRequestDelete(deleteMeta)
                          }
                          disabled={!deleteMeta}
                          className="text-xs font-semibold text-red-500 hover:underline transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:no-underline"
                        >
                          Supprimer
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-lg bg-poopay-card/60 px-4 py-6 text-center text-sm text-poopay-mute">
                  Aucune autre session active.
                </div>
              )}
            </>
          )}
        </div>
      </SimpleModal>

      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        title="Supprimer la session"
        message={confirmMessage}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        error={deleteError}
        isConfirming={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

function formatSessionDate(value) {
  if (!value) return "date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date inconnue";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} a ${hours}:${minutes}`;
}

function formatSessionDuration(durationSeconds, start, end) {
  let seconds = Number.isFinite(durationSeconds)
    ? Number(durationSeconds)
    : null;

  if (seconds == null && start) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime())
    ) {
      seconds = Math.max(
        0,
        Math.round((endDate.getTime() - startDate.getTime()) / 1000)
      );
    }
  }

  if (seconds == null) return "une duree inconnue";
  if (seconds < 60) return `${seconds} secondes`;

  const totalMinutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const segments = [];
  if (hours > 0) {
    segments.push(`${hours} ${hours > 1 ? "heures" : "heure"}`);
  }
  if (minutes > 0) {
    segments.push(`${minutes} ${minutes > 1 ? "minutes" : "minute"}`);
  }
  if (remainingSeconds > 0 && hours === 0) {
    segments.push(
      `${remainingSeconds} ${remainingSeconds > 1 ? "secondes" : "seconde"}`
    );
  }

  return segments.join(" ");
}

function formatSessionEarnings(amount) {
  const numeric = amount != null ? Number(amount) : null;
  if (numeric == null || Number.isNaN(numeric)) return "0,00 EUR";

  return (
    numeric.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " EUR"
  );
}
