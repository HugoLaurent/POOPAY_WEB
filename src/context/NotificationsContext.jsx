import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

import { API_BASE_URL, GroupsFetch, NotificationsFetch } from "@/api";
import { useAuthContext } from "./AuthContext.jsx";

const NotificationsContext = createContext(null);

function normalizeNotification(notification) {
  if (!notification || typeof notification !== "object") {
    return null;
  }

  const data =
    notification.data && typeof notification.data === "object"
      ? notification.data
      : {};

  return {
    ...notification,
    data,
    invitation: notification.invitation ?? null,
    createdAt: notification.createdAt ?? null,
    readAt: notification.readAt ?? null,
    isRead: Boolean(notification.isRead),
  };
}

function sortNotifications(list) {
  return [...list].sort((a, b) => {
    const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

export function NotificationsProvider({ children }) {
  const { token, user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  const upsertNotification = useCallback((incoming) => {
    const parsed = normalizeNotification(incoming);
    if (!parsed) return;

    setNotifications((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== parsed.id);
      return sortNotifications([parsed, ...withoutCurrent]);
    });
  }, []);

  const handleInvitationStatusUpdate = useCallback((payload) => {
    if (!payload || !payload.invitationId) return;
    setNotifications((prev) => {
      const updated = prev
        .map((item) => {
          if (item?.invitation?.id !== payload.invitationId) {
            return item;
          }

          const nextInvitation = {
            ...item.invitation,
            status: payload.status ?? item.invitation?.status ?? "pending",
          };

          if (item.type === "group_invitation") {
            return null;
          }

          return {
            ...item,
            invitation: nextInvitation,
            isRead: true,
            readAt: new Date().toISOString(),
          };
        })
        .filter(Boolean);

      return sortNotifications(updated);
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = await NotificationsFetch.list();
      const list = Array.isArray(payload?.notifications)
        ? payload.notifications
        : Array.isArray(payload)
        ? payload
        : [];
      const parsed = list
        .map(normalizeNotification)
        .filter(Boolean)
        .map((item) => ({ ...item, isRead: Boolean(item.isRead) }));
      setNotifications(sortNotifications(parsed));
    } catch (err) {
      console.error("fetchNotifications error", err);
      setError(err?.message || "Impossible de recuperer les notifications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsSocketReady(false);
  }, []);

  useEffect(() => {
    if (!token || !user?.id) {
      disconnectSocket();
      setNotifications([]);
      return;
    }

    let isMounted = true;

    fetchNotifications();

    const socketUrl =
      import.meta?.env?.VITE_SOCKET_URL?.replace(/\/+$/, "") ||
      API_BASE_URL ||
      window.location.origin;

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("socket:ready", () => {
      if (!isMounted) return;
      setIsSocketReady(true);
    });

    socket.on("connect", () => {
      if (!isMounted) return;
      setIsSocketReady(true);
      fetchNotifications();
    });

    socket.on("notification:new", (payload) => {
      if (!isMounted) return;
      upsertNotification(payload);
    });

    socket.on("invitation:updated", (payload) => {
      if (!isMounted) return;
      handleInvitationStatusUpdate(payload);
    });

    socket.on("socket:error", (socketError) => {
      console.error("Socket error", socketError);
    });

    socket.on("disconnect", () => {
      if (!isMounted) return;
      setIsSocketReady(false);
    });

    return () => {
      isMounted = false;
      disconnectSocket();
    };
  }, [
    token,
    user?.id,
    fetchNotifications,
    upsertNotification,
    handleInvitationStatusUpdate,
    disconnectSocket,
  ]);

  const respondToInvitation = useCallback(async (invitationId, action) => {
    if (!invitationId || !action) return;
    try {
      const response = await GroupsFetch.respondInvitation(
        invitationId,
        action
      );
      setNotifications((prev) => {
        const updated = prev
          .map((item) => {
            if (item?.invitation?.id !== invitationId) return item;

            const nextInvitation = {
              ...item.invitation,
              status: action === "accept" ? "accepted" : "declined",
            };

            if (item.type === "group_invitation") {
              return null;
            }

            return {
              ...item,
              invitation: nextInvitation,
              isRead: true,
              readAt: new Date().toISOString(),
            };
          })
          .filter(Boolean);

        return sortNotifications(updated);
      });

      if (socketRef.current && isSocketReady) {
        socketRef.current.emit("notifications:mark-read", []);
      }
      return response;
    } catch (err) {
      console.error("respondToInvitation error", err);
      throw err;
    }
  }, [isSocketReady]);

  const acceptInvitation = useCallback(
    (invitationId) => respondToInvitation(invitationId, "accept"),
    [respondToInvitation]
  );
  const declineInvitation = useCallback(
    (invitationId) => respondToInvitation(invitationId, "decline"),
    [respondToInvitation]
  );

  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationId) return;
    try {
      await NotificationsFetch.remove(notificationId);
      setNotifications((prev) =>
        prev.filter((item) => item.id !== notificationId)
      );
    } catch (err) {
      console.error("deleteNotification error", err);
      throw err;
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, item) => acc + (item.isRead ? 0 : 1), 0),
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      isSocketReady,
      refresh: fetchNotifications,
      acceptInvitation,
      declineInvitation,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      isSocketReady,
      fetchNotifications,
      acceptInvitation,
      declineInvitation,
      deleteNotification,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return ctx;
}
