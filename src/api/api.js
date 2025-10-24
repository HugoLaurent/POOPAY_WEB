// client qui JETTE (inchangé)
export async function api(
  path,
  { method = "GET", body, headers: extraHeaders } = {}
) {
  const token = localStorage.getItem("access_token") || "";
  const isForm = body instanceof FormData;

  const headers = { ...(extraHeaders || {}) };
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    (import.meta?.env?.VITE_API_URL || "http://localhost:3333") + path,
    {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    }
  );

  const ct = res.headers.get("content-type") || "";
  // ✅ petit plus: gérer 204 No Content proprement
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
  return payload?.data ?? payload;
}

/* Endpoints */
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
  deleteSession: (sessionId) =>
    api(`/sessions/${sessionId}`, { method: "DELETE" }),
};

export const ClassementFetch = {
  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/rankings${query ? "?" + query : ""}`, { method: "GET" });
  },
};

export const GroupsFetch = {
  getGroups: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/groups${query ? "?" + query : ""}`, { method: "GET" });
  },
};
