import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "@/assets/logo/logoPoopay.png";
import NotificationsModal from "./NotificationsModal.jsx";
import Toast from "./Toast.jsx";
import { useNotifications } from "@/hooks";

export default function Header() {
  const { pathname } = useLocation();
  const { unreadCount } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "success",
  });

  return (
    <header className="pt-4 px-5 max-w-3xl mx-auto w-full">
      <div className="max-w-3xl mx-auto">
        {/* Ligne de titre centrée avec le bouton de notifications à droite */}
        <div className="grid grid-cols-3 items-start">
          <div />

          <div className="text-center">
            <h1 className="text-3xl text-center font-extrabold tracking-tight text-poopay-text">
              <Link
                to="/"
                aria-label="Revenir à l'accueil"
                className="inline-flex items-center justify-center px-2 py-1 rounded-md hover:text-poopay-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-poopay-pill"
              >
                POOPAY
              </Link>
            </h1>
          </div>

          <div className="justify-self-end">
            <button
              type="button"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform"
              aria-label="Notifications"
              onClick={() => setIsModalOpen(true)}
            >
              <img
                src={logo}
                alt="Logo Poopay"
                className="w-18 h-18 object-contain select-none"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1.5 py-px rounded-full bg-red-500 text-white text-[11px] leading-3.5 font-semibold flex items-center justify-center shadow">
                  {Math.min(unreadCount, 99)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bandeau du classement */}
        {pathname === "/leaderboard" && (
          <div className="mt-4 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold mb-1 text-[#8B4513]">
              Classements
            </h2>
            <p className="text-sm opacity-90 max-w-[38ch] text-[rgb(90,62,40)]">
              Compare les meilleurs groupes par région ou par catégorie de
              travail.
            </p>
          </div>
        )}
      </div>

      <NotificationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionSuccess={(message) => {
          setToast({
            isOpen: true,
            message,
            variant: "success",
          });
        }}
      />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </header>
  );
}
