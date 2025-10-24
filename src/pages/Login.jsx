import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass } from "lucide-react";
import { Auth } from "../api/api";
import { applyTheme } from "../hooks/useTheme";
import logo from "../assets/logo/logoPoopay.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  const canSubmit =
    email.trim().length > 3 && pwd.length >= 12 && hasSpecialChar && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await Auth.login(email, pwd); // <= ici "data" = payload.data
      if (data?.token) localStorage.setItem("access_token", data.token);
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (typeof data.user.id !== "undefined") {
          localStorage.setItem("user_id", String(data.user.id));
        }
        if (data.user.username) {
          localStorage.setItem("username", data.user.username);
        }
        if (data.user.theme) {
          applyTheme(data.user.theme);
        }
      }
      navigate("/");
    } catch (e) {
      setErr(e.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-poopay-bg flex items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        {/* Logo + titre */}
        <div className="mb-8">
          <img
            src={logo}
            alt="Logo Poopay"
            className="mx-auto w-24 h-24 object-contain text-poopay-active"
          />
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-poopay-text">
            POOPAY
          </h1>
          <p className="mt-1 text-poopay-text/70">
            Combien vaut ta pause&nbsp;?
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className=" px-6 py-7 text-left mx-auto">
          <label className="block text-[15px] font-semibold text-poopay-active mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="ton.email@example.com"
            autoComplete="email"
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-3xl bg-white/70 text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition mb-4"
          />

          <label className="block text-[15px] font-semibold text-poopay-active mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="Au moins 12 caractères et un spécial…"
            autoComplete="current-password"
            disabled={loading}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-3xl bg-white/70 text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition mb-6"
          />

          {err && (
            <p
              aria-live="assertive"
              className="mb-3 text-sm text-red-600 bg-red-50/70 rounded-2xl px-3 py-2"
            >
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-3xl px-5 py-3 font-semibold text-white shadow-soft transition
              ${
                loading
                  ? "bg-poopay-active/70"
                  : "bg-poopay-active hover:opacity-95"
              }
              disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <Hourglass className="animate-pulse" size={18} />
                Chargement…
              </span>
            ) : (
              "Se connecter"
            )}
          </button>

          <div className="mt-5 text-center text-sm">
            <a
              href="/signup"
              className="text-poopay-text/90 hover:opacity-80 underline"
            >
              Pas de compte ? S’inscrire
            </a>
          </div>
        </form>

        <p className="mt-6 text-center text-xs italic text-poopay-mute">
          Prêt(e) à devenir un(e) expert(e) du transit ?
        </p>
      </div>
    </div>
  );
}
