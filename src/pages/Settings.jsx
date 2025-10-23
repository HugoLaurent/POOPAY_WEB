// src/pages/Settings.jsx
import { useState } from "react";
import { useTheme } from "../hooks/useTheme"; // géré par le layout

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [notifications, setNotifications] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr");
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("username", username);
    localStorage.setItem("lang", lang);
    // branche si besoin: await api.saveSettings({ username, notifications, theme, lang })
    setSaving(false);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-24">
      <div className="px-4 pt-4">
        <h1 className="text-[22px] font-extrabold text-poopay-text">
          Réglages
        </h1>
      </div>

      {/* Carte principale */}
      <div className="mx-3 mt-3 rounded-3xl bg-poopay-card  px-5 py-5">
        {/* Nom d’utilisateur */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-poopay-mute mb-1">
            Nom d’utilisateur
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl px-3 py-2 bg-poopay-card/60 border border-black/5 dark:border-white/5
                       text-poopay-text placeholder:text-poopay-mute focus:outline-none
                       focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            placeholder="Ton pseudo"
          />
        </div>

        {/* Mode sombre */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-[15px] font-medium text-poopay-text">
              Mode sombre
            </p>
            <p className="text-[12px] text-poopay-mute mt-0.5">
              Activer le thème sombre
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-12 h-7 rounded-full p-1 transition 
              ${
                theme === "dark"
                  ? "bg-black/70 dark:bg-white/70"
                  : "bg-black/10 dark:bg-white/10"
              }`}
          >
            <div
              className={`w-5 h-5 bg-white dark:bg-black rounded-full transition transform
                ${theme === "dark" ? "translate-x-5" : ""}`}
            />
          </button>
        </div>

        {/* Plus d'options */}
        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5">
          <ul className="space-y-2 text-[14px]">
            <li className="text-poopay-text/90">Mes sessions</li>
            <li className="text-poopay-text/90">Exporter mes données</li>
            <li className="text-poopay-text/90">Effacer le cache</li>
            <li className="text-poopay-text/90">
              Confidentialité et permissions
            </li>
            <li className="text-poopay-text/90">Gérer l’abonnement</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="mx-3 mt-5 flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition border bg-[#8B4513] text-white border-[#8B4513]"
        >
          {saving ? "Enregistrement…" : "Sauvegarder"}
        </button>

        <button
          className="text-[14px] text-red-500"
          onClick={() => {
            /* onLogout?.() */
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
