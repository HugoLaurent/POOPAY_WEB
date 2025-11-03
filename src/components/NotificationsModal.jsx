import { useEffect, useMemo, useState } from "react";

import SimpleModal from "./SimpleModal.jsx";
import { useNotifications } from "@/hooks";

function formatDate(date) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

function NotificationContent({ notification }) {
  const type = notification?.type;
  const invitation = notification?.invitation;
  const status = invitation?.status ?? "pending";
  const inviterName =
    invitation?.inviter?.name ??
    notification?.data?.inviterName ??
    "Un membre";
  const inviteeName =
    invitation?.invitee?.name ??
    notification?.data?.inviteeName ??
    "Un membre";
  const groupName =
    invitation?.group?.name ?? notification?.data?.groupName ?? "ton groupe";

  switch (type) {
    case "group_invitation":
      return `${inviterName} t'invite a rejoindre "${groupName}"${
        invitation?.message ? ` : ${invitation.message}` : ""
      }`;
    case "group_invitation_response": {
      const verb = status === "accepted" ? "a accepte" : "a refuse";
      return `${inviteeName} ${verb} ton invitation pour "${groupName}"`;
    }
    case "group_member_left": {
      const memberName =
        notification?.data?.memberName || notification?.data?.memberEmail;
      return `${memberName || "Un membre"} a quitte "${groupName}"`;
    }
    default:
      return notification?.data?.message ?? "Notification";
  }
}

export default function NotificationsModal({ isOpen, onClose, onActionSuccess }) {
  const {
    notifications,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    deleteNotification,
  } = useNotifications();
  const [pendingActionKey, setPendingActionKey] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [localError, setLocalError] = useState("");

  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    if (!isOpen) {
      setLocalError("");
      setPendingActionKey("");
      setPendingDeleteId(null);
    }
  }, [isOpen]);

  const invitationPendingIds = useMemo(() => {
    const ids = notifications
      .filter(
        (item) =>
          item.type === "group_invitation" &&
          item?.invitation?.status === "pending" &&
          item?.invitation?.id
      )
      .map((item) => item.invitation?.id)
      .filter(Boolean);
    return new Set(ids);
  }, [notifications]);

  const handleRespond = async (invitationId, action) => {
    if (!invitationId || !action) return;
    const key = `${invitationId}:${action}`;
    setPendingActionKey(key);
    setLocalError("");
    try {
      const response =
        action === "accept"
          ? await acceptInvitation(invitationId)
          : await declineInvitation(invitationId);

      const groupName =
        response?.notification?.invitation?.group?.name ||
        response?.notification?.data?.groupName;

      const message =
        action === "accept"
          ? `Invitation acceptee${groupName ? ` pour "${groupName}"` : ""}.`
          : `Invitation refusee${groupName ? ` pour "${groupName}"` : ""}.`;

      onActionSuccess?.(message);
      onClose?.();
    } catch (err) {
      const message =
        err?.message === "invitation_already_processed"
          ? "Cette invitation a deja ete traitee."
          : err?.message || "Impossible de traiter la reponse a l'invitation.";
      setLocalError(message);
    } finally {
      setPendingActionKey("");
    }
  };

  const handleDelete = async (notificationId) => {
    if (!notificationId) return;
    setPendingDeleteId(notificationId);
    setLocalError("");
    try {
      await deleteNotification(notificationId);
      onActionSuccess?.("Notification supprimee.");
    } catch (err) {
      const message =
        err?.message === "notification_cannot_be_deleted"
          ? "Tu dois accepter ou refuser l'invitation avant de supprimer cette notification."
          : err?.message || "Impossible de supprimer la notification.";
      setLocalError(message);
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <SimpleModal isOpen={isOpen} onClose={onClose} className="rounded-t-3xl">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-poopay-text">
            Notifications
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-poopay-mute hover:text-poopay-text transition"
          >
            Fermer
          </button>
        </div>

        {(error || localError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {localError || error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-poopay-mute">
            <span className="animate-pulse">Chargement des notifications...</span>
          </div>
        ) : !hasNotifications ? (
          <div className="py-10 text-center text-poopay-mute text-sm">
            Aucune notification pour le moment.
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => {
              const invitation = notification.invitation;
              const invitationId = invitation?.id ?? null;
              const isInvitationPending =
                notification.type === "group_invitation" &&
                invitation?.status === "pending" &&
                Boolean(invitationId);
              const actionKeyAccept = invitationId
                ? `${invitationId}:accept`
                : "";
              const actionKeyDecline = invitationId
                ? `${invitationId}:decline`
                : "";
              const createdLabel = formatDate(notification.createdAt);
              const showInvitationStatus =
                Boolean(invitation) && invitation?.status !== "pending";

              return (
                <li
                  key={notification.id}
                  className="rounded-2xl border border-black/5 bg-poopay-card/70 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#8B4513]" />
                        )}
                        <p className="text-sm font-medium text-poopay-text">
                          <NotificationContent notification={notification} />
                        </p>
                      </div>
                      {createdLabel && (
                        <p className="text-xs text-poopay-mute">
                          {createdLabel}
                        </p>
                      )}
                      {showInvitationStatus && (
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            invitation?.status === "accepted"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {invitation?.status === "accepted"
                            ? "Acceptee"
                            : "Refusee"}
                        </span>
                      )}
                    </div>
                    {!isInvitationPending && (
                      <button
                        type="button"
                        onClick={() => handleDelete(notification.id)}
                        disabled={pendingDeleteId === notification.id}
                        className="text-xs text-red-500 hover:text-red-600 transition disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  {isInvitationPending &&
                    invitationId &&
                    invitationPendingIds.has(invitationId) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespond(invitation.id, "accept")}
                        disabled={pendingActionKey === actionKeyAccept}
                        className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {pendingActionKey === actionKeyAccept
                          ? "Validation..."
                          : "Accepter"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespond(invitation.id, "decline")}
                        disabled={pendingActionKey === actionKeyDecline}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {pendingActionKey === actionKeyDecline
                          ? "Refus..."
                          : "Refuser"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SimpleModal>
  );
}
