// api.js

const RAW_BASE = import.meta?.env?.VITE_API_URL ?? "http://localhost:3333";
// retire tous les / de fin (http://x:3333//// -> http://x:3333)
const BASE = RAW_BASE.replace(/\/+$/, "");

export const API_BASE_URL = BASE || "";

function joinUrl(base, path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function api(
  path,
  { method = "GET", body, headers: extraHeaders, raw = false } = {}
) {
  const token = localStorage.getItem("access_token") || "";
  const isForm = body instanceof FormData;

  const headers = { ...(extraHeaders || {}) };
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = joinUrl(BASE || "", path);
  const res = await fetch(url, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const ct = res.headers.get("content-type") || "";
  const payload =
    res.status === 204
      ? null
      : ct.includes("application/json")
      ? await res.json()
      : await res.text();

  if (!res.ok) {
    const msg = payload?.message || res.statusText || "Erreur";
    throw new Error(msg);
  }
  if (payload && payload.result === false) {
    throw new Error(payload.message || "Erreur");
  }
  return raw ? payload : payload?.data ?? payload;
}

/* Points de terminaison */
export const Auth = {
  login: (email, password) =>
    api("/login", { method: "POST", body: { email, password } }),
  register: (payload) => api("/signup", { method: "POST", body: payload }),
  logout: () => api("/logout", { method: "POST" }),
  getSessions: () => api("/sessions", { method: "GET" }),
  me: (token) =>
    api("/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const User = {
  changeTheme: (theme) =>
    api("/change-theme", { method: "POST", body: { theme } }),
  getAllData: () => api("/user/data", { method: "GET" }),
};

export const HomeFetch = {
  getStats: () => api("/home", { method: "GET" }),
};

export const SessionsFetch = {
  getSessions: () => api("/sessions", { method: "GET" }),
  createSession: (payload) =>
    api("/sessions", { method: "POST", body: payload }),
  deleteSession: (sessionId) =>
    api(`/sessions/${sessionId}`, { method: "DELETE" }),
  deleteAllSessions: () => api(`/sessions`, { method: "DELETE" }),
};

export const ClassementFetch = {
  getStats: async (params = {}) => {
    // Normalise les paramètres : associe (mode, filtre) à (région | catégorie)
    const { mode, filter, ...rest } = params || {};
    const queryObj = { ...rest };
    if (typeof filter !== "undefined" && filter !== null && filter !== "") {
      if (mode === "region") queryObj.region = filter;
      else if (mode === "category") queryObj.category = filter;
      else queryObj.filter = filter;
    }
    if (mode) queryObj.mode = mode;
    const query = new URLSearchParams(queryObj).toString();
    const payload = await api(`/rankings${query ? "?" + query : ""}`, {
      method: "GET",
      raw: true,
    });

    // Normalise la forme de retour pour le front-end
    const list = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.rankings)
      ? payload.rankings
      : Array.isArray(payload?.classementData)
      ? payload.classementData
      : Array.isArray(payload)
      ? payload
      : [];

    return { dataUser: payload?.dataUser, data: list };
  },
};

export const GroupsFetch = {
  getGroups: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/groups${query ? "?" + query : ""}`, { method: "GET" });
  },
  createGroup: (payload) =>
    api("/groups/create", { method: "POST", body: payload }),
  inviteMember: (groupId, payload) =>
    api(`/groups/${groupId}/invitations`, { method: "POST", body: payload }),
  respondInvitation: (invitationId, action) =>
    api(`/group-invitations/${invitationId}/respond`, {
      method: "POST",
      body: { action },
    }),
  leaveGroup: (groupId) =>
    api(`/groups/${groupId}/leave`, { method: "POST" }),
};

export const NotificationsFetch = {
  list: () => api("/notifications", { method: "GET" }),
  markRead: (notificationId) =>
    api(`/notifications/${notificationId}/read`, { method: "POST" }),
  remove: (notificationId) =>
    api(`/notifications/${notificationId}`, { method: "DELETE" }),
};

export const PaymentsFetch = {
  list: () => api("/payments", { method: "GET" }),
  createIntent: (payload) =>
    api("/payments/intent", { method: "POST", body: payload }),
  sync: (paymentId) => api(`/payments/${paymentId}/sync`, { method: "POST" }),
};
