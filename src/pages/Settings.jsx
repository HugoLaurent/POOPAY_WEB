// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks"; // handled by the layout

import { User } from "@/api";
import { MesSessions, SubscriptionManager } from "@/pages/SettingsComponents";
import { openPrintWindow } from "@/utils";
import { showTarteaucitronUi } from "@/utils/tarteaucitron.js";
import { useAuthContext } from "@/context/AuthContext";
import SimpleModal from "@/components/SimpleModal.jsx";
import { PasswordResetModal, Toast } from "@/components";

export default function Settings() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, logout, updateUser } = useAuthContext();

  const [username, setUsername] = useState(user?.username ?? "");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [monthlyHours, setMonthlyHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] =
    useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "success",
  });

  // On vide les champs pour utiliser les placeholders basés sur user
  useEffect(() => {
    setUsername("");
    setMonthlySalary("");
    setMonthlyHours("");
  }, [user?.username, user?.monthlySalary, user?.monthlyHours]);

  async function clearCacheAndLogout() {
    setIsConfirmingReset(false);
    try {
      await logout({ notifyServer: true });
      localStorage.clear();
      sessionStorage.clear?.();
      navigate("/login");
    } catch (err) {
      console.error("Erreur lors du reset:", err);
    }
  }

  function openCookiesManager() {
    showTarteaucitronUi();
    const panel = window?.tarteaucitron?.userInterface;
    if (panel?.openPanel) {
      panel.openPanel();
      return;
    }
    window?.alert?.("Centre de gestion des cookies indisponible.");
  }

  async function handleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    try {
      await User.changeTheme(newTheme);
      updateUser({ theme: newTheme });
    } catch (err) {
      console.error("Impossible de changer le theme :", err);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaveError("");

    const payload = {};

    // username : on l'envoie uniquement si rempli
    const nextUsername = username.trim();
    if (nextUsername) {
      payload.username = nextUsername;
    }

    // salaire : on parse uniquement si rempli
    const salaryInput = monthlySalary.trim();
    if (salaryInput) {
      const salaryValue = Number(salaryInput.replace(",", "."));
      if (!Number.isFinite(salaryValue) || salaryValue <= 0) {
        setSaveError("Le salaire doit être un nombre positif.");
        return;
      }
      payload.monthlySalary = salaryValue;
    }

    // heures : pareil
    const hoursInput = monthlyHours.trim();
    if (hoursInput) {
      const hoursValue = Number(hoursInput.replace(",", "."));
      if (!Number.isFinite(hoursValue) || hoursValue <= 0) {
        setSaveError("Les heures doivent être un nombre positif.");
        return;
      }
      payload.monthlyHours = hoursValue;
    }

    // sécurité : normalement impossible car bouton désactivé, mais au cas où
    if (Object.keys(payload).length === 0) {
      setSaveError("Modifie au moins un champ avant de sauvegarder.");
      return;
    }

    setSaving(true);
    try {
      const response = await User.updateProfile(payload);
      const updatedUser =
        response && typeof response === "object" && response.user
          ? response.user
          : response;

      if (updatedUser && typeof updatedUser === "object") {
        updateUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
      } else {
        updateUser((prev) => (prev ? { ...prev, ...payload } : prev));
      }

      setToast({
        isOpen: true,
        message: "Profil mis a jour avec succes.",
        variant: "success",
      });
    } catch (err) {
      setSaveError(
        err?.message || "Impossible d'enregistrer les modifications."
      );
    } finally {
      setSaving(false);
    }
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

  // Le bouton s'active dès que l'utilisateur a touché au moins un champ
  const hasTypedSomething =
    username.trim() !== "" ||
    monthlySalary.trim() !== "" ||
    monthlyHours.trim() !== "";

  const isSaveDisabled = saving || !hasTypedSomething;

  const closeToast = () =>
    setToast((prev) => ({
      ...prev,
      isOpen: false,
    }));

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-24">
        <div className="px-4 pt-4">
          <h1 className="text-[22px] font-extrabold text-poopay-text">
            Reglages
          </h1>
        </div>

        {/* Carte principale */}
        <div className="mx-3 mt-3 rounded-3xl bg-poopay-card px-5 py-5">
          <div className="mb-4 rounded-2xl border border-poopay-card/60 bg-poopay-card/80 px-4 py-3 text-sm text-poopay-text/80 shadow-inner">
            {user?.isPremium ? (
              <p>
                <span className="font-semibold text-poopay-text">
                  Abonnement premium actif.
                </span>{" "}
                Tu peux cr&eacute;er des groupes jusqu&apos;&agrave; 10 membres.
              </p>
            ) : (
              <p>
                Passe en{" "}
                <span className="font-semibold text-poopay-text">premium</span>{" "}
                pour enlever la limite de 3 membres par groupe.
              </p>
            )}
          </div>

          {/* Nom d'utilisateur */}
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-poopay-mute">
              Nom d&apos;utilisateur
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              name="settings-username"
              className="w-full rounded-xl border border-black/5 bg-poopay-card/60 px-3 py-2 text-poopay-text placeholder:text-poopay-mute focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/5 dark:focus:ring-white/10"
              placeholder={user?.username || "Ex: Jean"}
            />
          </div>

          {/* Salaire mensuel */}
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-poopay-mute">
              Salaire mensuel (&euro;)
            </label>
            <input
              value={monthlySalary}
              inputMode="decimal"
              onChange={(e) => setMonthlySalary(e.target.value)}
              autoComplete="off"
              name="settings-salary"
              className="w-full rounded-xl border border-black/5 bg-poopay-card/60 px-3 py-2 text-poopay-text placeholder:text-poopay-mute focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/5 dark:focus:ring-white/10"
              placeholder={
                Number.isFinite(Number(user?.monthlySalary))
                  ? String(user.monthlySalary)
                  : "****"
              }
            />
          </div>

          {/* Heures de travail mensuelles */}
          <div className="mb-6">
            <label className="mb-1 block text-[13px] font-medium text-poopay-mute">
              Heures de travail mensuelles
            </label>
            <input
              value={monthlyHours}
              inputMode="decimal"
              onChange={(e) => setMonthlyHours(e.target.value)}
              autoComplete="off"
              name="settings-hours"
              className="w-full rounded-xl border border-black/5 bg-poopay-card/60 px-3 py-2 text-poopay-text placeholder:text-poopay-mute focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/5 dark:focus:ring-white/10"
              placeholder={
                Number.isFinite(Number(user?.monthlyHours))
                  ? String(user.monthlyHours)
                  : "Ex: 151"
              }
            />
          </div>

          {/* Mode sombre */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[15px] font-medium text-poopay-text">
                Mode sombre
              </p>
              <p className="mt-0.5 text-[12px] text-poopay-mute">
                Activer le theme sombre
              </p>
            </div>
            <button
              onClick={handleTheme}
              className={`h-7 w-12 rounded-full p-1 transition 
              ${
                theme === "dark"
                  ? "bg-black/70 dark:bg-white/70"
                  : "bg-black/10 dark:bg-white/10"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white dark:bg-black transition transform
                ${theme === "dark" ? "translate-x-5" : ""}`}
              />
            </button>
          </div>

          {/* Plus d'options */}
          <div className="mt-5 border-t border-black/5 pt-4 dark:border-white/5">
            <ul className="space-y-2 text-[14px]">
              <li>
                <button
                  type="button"
                  onClick={() => setIsSessionsModalOpen(true)}
                  className="w-full text-left text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                >
                  Mes sessions
                </button>
              </li>

              <li className="text-poopay-text/90">
                <button
                  type="button"
                  onClick={handleGetAllData}
                  className="w-full text-left text-poopay-text/90 transition hover:text-poopay-text hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isExporting}
                >
                  {isExporting
                    ? "Preparation de l'impression..."
                    : "Exporter mes données"}
                </button>
              </li>

              <li className="text-poopay-text/90">
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(true)}
                  className="w-full text-left text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                >
                  Effacer le cache
                </button>
              </li>

              <li className="text-poopay-text/90">
                <button
                  type="button"
                  onClick={() => setIsPasswordResetModalOpen(true)}
                  className="w-full text-left text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                >
                  Recevoir un lien de réinitialisation
                </button>
              </li>

              <li className="text-poopay-text/90 space-y-1">
                <span className="text-xs uppercase tracking-wide text-poopay-mute">
                  Liens légaux
                </span>
                <div className="flex flex-col gap-1 text-sm">
                  <Link
                    to="/mentions-legales"
                    className="text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                  >
                    Mentions légales
                  </Link>
                  <Link
                    to="/politique-de-confidentialite"
                    className="text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                  >
                    Politique de confidentialité
                  </Link>
                  <Link
                    to="/cgv"
                    className="text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                  >
                    CGV
                  </Link>
                  <button
                    type="button"
                    onClick={openCookiesManager}
                    className="text-left text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                  >
                    Cookies
                  </button>
                  <a
                    href="mailto:privacy@poopay.app?subject=Demande%20DPO"
                    className="text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                  >
                    Me contacter
                  </a>
                </div>
              </li>

              <li className="text-poopay-text/90">
                <button
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="w-full text-left text-poopay-text/90 transition hover:text-poopay-text hover:underline"
                >
                  Gérer mon abonnement (Stripe test)
                </button>
              </li>
            </ul>
          </div>

          {saveError && (
            <p className="mx-3 mt-2 text-sm text-red-600">{saveError}</p>
          )}

          <div className="mx-3 mt-5 flex items-center justify-between">
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              className="rounded-xl border border-[#8B4513] bg-[#8B4513] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Sauvegarder"}
            </button>

            <button
              className="text-[14px] text-red-500"
              onClick={async () => {
                await logout({ notifyServer: true });
                navigate("/login");
              }}
            >
              Se déconnecter
            </button>
          </div>

          <MesSessions
            isOpen={isSessionsModalOpen}
            onClose={() => setIsSessionsModalOpen(false)}
          />

          <PasswordResetModal
            isOpen={isPasswordResetModalOpen}
            onClose={() => setIsPasswordResetModalOpen(false)}
            forceEmail={user?.email || ""}
          />

          <SimpleModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            className="rounded-t-3xl"
          >
            <div className="relative space-y-6 px-5 py-6">
              <button
                type="button"
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-poopay-card/70 px-3 py-1 text-xs font-semibold text-poopay-text/80 transition hover:text-poopay-text"
              >
                Fermer
              </button>
              <header className="space-y-1 pr-16">
                <h2 className="text-xl font-semibold text-poopay-text">
                  Gestion de l&apos;abonnement premium
                </h2>
                <p className="text-sm text-poopay-text/70">
                  Paiement en mode test uniquement. Utilise la carte 4242 4242
                  4242 4242 pour activer le premium sur ton compte.
                </p>
              </header>
              <SubscriptionManager />
            </div>
          </SimpleModal>
        </div>

        {isConfirmingReset && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-reset-title"
          >
            <div className="w-full max-w-sm space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-poopay-card">
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
                  className="rounded-lg border border-black/10 bg-poopay-card/70 px-4 py-2 text-sm font-medium text-poopay-text transition hover:bg-poopay-card/90"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={clearCacheAndLogout}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        variant={toast.variant}
        onClose={closeToast}
      />
    </>
  );
}
