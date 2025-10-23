// src/api/api.js
const BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3333";

export async function api(
  path,
  { method = "GET", body, headers: extraHeaders } = {}
) {
  const token = localStorage.getItem("access_token") || "";
  const isForm = body instanceof FormData;

  const headers = { ...(extraHeaders || {}) };
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json")
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
  me: (token) =>
    api("/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const HomeFetch = {
  getStats: () => api("/home", { method: "GET" }),
};
