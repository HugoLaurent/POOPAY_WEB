﻿// src/pages/Settings.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme"; // handled by the layout

import { Auth, User } from "@/api/api";
import MesSessions from "./SettingsComponents/MesSessions";
import { openPrintWindow } from "@/utils/printExport";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [saving, setSaving] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  async function clearCacheAndLogout() {
    setIsConfirmingReset(false);
    try {
      Auth.logout();
      localStorage.clear();
      sessionStorage.clear?.();

      navigate("/login");
    } catch (err) {
      console.error("Erreur lors du reset:", err);
    }
  }

  async function handleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    try {
      await User.changeTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      console.error("Impossible de changer le theme :", err);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("username", username);
    setSaving(false);
  }

  async function handleGetAllData() {
    setIsExporting(true);
    try {
      const data = await User.getAllData();
      if (!data) {
        console.error("Aucune donnee a imprimer.");
        return;
      }
      const success = openPrintWindow(data);
      if (!success) {
        alert(
          "Impossible d'ouvrir la fenetre d'impression. Autorisez les fenetres pop-up et reessayez."
        );
      }
    } catch (err) {
      console.error("Impossible de recuperer les donnees :", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-24">
      <div className="px-4 pt-4">
        <h1 className="text-[22px] font-extrabold text-poopay-text">
          Reglages
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
              Activer le theme sombre
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

            <li className="text-poopay-text/90">
              <button
                type="button"
                onClick={handleGetAllData}
                className="w-full text-left text-poopay-text/90 hover:text-poopay-text hover:underline transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isExporting}
              >
                {isExporting
                  ? "Preparation de l'impression..."
                  : "Exporter mes donnees"}
              </button>
            </li>

            <li className="text-poopay-text/90">
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                className="w-full text-left text-poopay-text/90 hover:text-poopay-text hover:underline transition"
              >
                Effacer le cache
              </button>
            </li>

            <li className="text-poopay-text/90">
              Confidentialite et permissions
            </li>
            <li className="text-poopay-text/90">Gerer l'abonnement</li>
          </ul>
        </div>

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
            Se deconnecter
          </button>
        </div>
        <MesSessions
          isOpen={isSessionsModalOpen}
          onClose={() => setIsSessionsModalOpen(false)}
        />
      </div>

      {isConfirmingReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-poopay-card shadow-xl p-6 space-y-5">
            <div className="space-y-2">
              <h2
                id="confirm-reset-title"
                className="text-lg font-semibold text-poopay-text"
              >
                Cette action va vous deconnecter
              </h2>
              <p className="text-sm text-poopay-mute">
                Effacer le cache supprimera vos donnees locales et vous
                redirigera vers la page de connexion. Voulez-vous continuer ?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingReset(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-poopay-text bg-poopay-card/70 border border-black/10 hover:bg-poopay-card/90 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={clearCacheAndLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
