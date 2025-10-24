// src/pages/Settings.jsx
import { useState } from "react";
import { useTheme } from "../hooks/useTheme"; // handled by the layout

import { Auth, User } from "../api/api";
import SimpleModal from "../components/SimpleModal";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [saving, setSaving] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  async function handleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    try {
      await User.changeTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      console.error("Impossible de changer le thème :", err);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("username", username);
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
        {/* Nom d'utilisateur */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-poopay-mute mb-1">
            Nom d'utilisateur
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
            onClick={handleTheme}
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
            <li>
              <button
                type="button"
                onClick={() => setIsSessionsModalOpen(true)}
                className="w-full text-left text-poopay-text/90 hover:text-poopay-text hover:underline transition"
              >
                Mes sessions
              </button>
            </li>
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
          {saving ? "Enregistrement..." : "Sauvegarder"}
        </button>

        <button
          className="text-[14px] text-red-500"
          onClick={() => {
            Auth.logout();
          }}
        >
          Se déconnecter
        </button>
      </div>

      <SimpleModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
      >
        <div className="p-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-poopay-text">
              Mes sessions actives
            </h2>
            <button
              type="button"
              onClick={() => setIsSessionsModalOpen(false)}
              className="text-sm text-poopay-mute hover:text-poopay-text transition"
            >
              Fermer
            </button>
          </header>
          <p className="text-sm text-poopay-mute">
            Revois les appareils connectes et deconnecte ceux que tu ne reconnais pas.
          </p>
          <ul className="space-y-3 text-sm text-poopay-text">
            <li className="flex items-center justify-between rounded-lg bg-poopay-card/80 px-4 py-3">
              <div>
                <p className="font-medium">iPhone 15 - Safari</p>
                <p className="text-xs text-poopay-mute">Derniere activite : il y a 2 heures</p>
              </div>
              <button className="text-xs font-semibold text-red-500 hover:underline transition">
                Deconnecter
              </button>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-poopay-card/80 px-4 py-3">
              <div>
                <p className="font-medium">MacBook - Chrome</p>
                <p className="text-xs text-poopay-mute">Derniere activite : en cours</p>
              </div>
              <button className="text-xs font-semibold text-red-500 hover:underline transition">
                Deconnecter
              </button>
            </li>
          </ul>
        </div>
      </SimpleModal>
    </div>
  );
}
