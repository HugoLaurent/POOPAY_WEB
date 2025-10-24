import { useLocation } from "react-router-dom";
import logo from "@/assets/logo/logoPoopay.png";

export default function Header() {
  const { pathname } = useLocation();
  const notifCount = 3; // branche sur ton state/API

  return (
    <header className="pt-4 px-5 max-w-3xl mx-auto w-full">
      <div className="max-w-3xl mx-auto">
        {/* Ligne titre + logo à droite, texte centré pile */}
        <div className="grid grid-cols-3 items-start">
          {/* Col 1 vide pour équilibrer */}
          <div />

          {/* Col 2 : texte centré */}
          <div className="text-center">
            <h1 className="text-3xl text-center font-extrabold tracking-tight text-poopay-text">
              POOPAY
            </h1>
          </div>

          {/* Col 3 : logo + badge notifs aligné à droite */}
          <div className="justify-self-end">
            <button
              className="relative w-10 h-10 flex items-center justify-center rounded-full
                         hover:scale-105 active:scale-95 transition-transform"
              aria-label="Notifications"
            >
              <img
                src={logo}
                alt="Logo Poopay"
                className="w-18 h-18 object-contain select-none"
              />
              {notifCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                             px-1.5 py-px rounded-full bg-red-500 text-white
                             text-[11px] leading-3.5 font-semibold
                             flex items-center justify-center shadow"
                >
                  {notifCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bloc spécifique leaderboard sous le header */}
        {pathname === "/leaderboard" && (
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="text-3xl mb-1">🏆</div>
            <h2 className="text-xl font-bold mb-1 text-[#8B4513]">
              Classements
            </h2>
            <p className="text-sm opacity-90 max-w-[38ch] text-[rgb(90,62,40)]">
              Compare les meilleurs groupes par région ou par catégorie de
              travail
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
