import { useCallback } from "react";
import { Link } from "react-router-dom";
import { showTarteaucitronUi } from "@/utils/tarteaucitron.js";

const combineClasses = (...classes) => classes.filter(Boolean).join(" ").trim();

export default function LegalLinks({ className = "" }) {
  const handleOpenCookies = useCallback(() => {
    showTarteaucitronUi();
    const panel = window?.tarteaucitron?.userInterface;
    if (panel?.openPanel) {
      panel.openPanel();
      return;
    }
    window?.alert?.("Centre de gestion des cookies indisponible.");
  }, []);

  return (
    <div
      className={combineClasses(
        "text-center text-[12px] text-poopay-mute space-y-2",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link to="/mentions-legales" className="underline hover:text-poopay-text">
          Mentions légales
        </Link>
        <Link
          to="/politique-de-confidentialite"
          className="underline hover:text-poopay-text"
        >
          Politique de confidentialité
        </Link>
        <Link to="/cgv" className="underline hover:text-poopay-text">
          CGV
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={handleOpenCookies}
          className="underline text-poopay-mute hover:text-poopay-text transition"
        >
          Cookies
        </button>
        <a
          href="mailto:privacy@poopay.app?subject=Demande%20DPO"
          className="underline text-poopay-mute hover:text-poopay-text transition"
        >
          DPO
        </a>
      </div>
    </div>
  );
}
