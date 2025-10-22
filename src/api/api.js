const BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3333";

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("access_token") || "";
  const isForm = body instanceof FormData;

  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    // enlève si pas de cookies serveur :
    // credentials: 'include',
  });

  // essaie de parser JSON, sinon texte
  let payload;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) payload = await res.json();
  else payload = await res.text();

  // 1) si HTTP pas ok => on => jette avec message
  if (!res.ok) {
    const msg = payload?.message || res.statusText || "Erreur";
    throw new Error(msg);
  }

  // 2) si HTTP ok mais format standard renvoie result=false (cas rare) => jette aussi
  if (payload && payload.result === false) {
    throw new Error(payload.message || "Erreur");
  }

  // 3) sinon OK : retourne toujours payload.data (ou payload)
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
