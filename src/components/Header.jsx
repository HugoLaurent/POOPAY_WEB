import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  if (location.pathname === "/leaderboard") {
    return (
      <header className="px-5 pt-4 flex flex-col items-center text-center">
        <div className="text-3xl mb-1">🏆</div>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#8B4513" }}>
          Classements
        </h1>
        <p className="text-sm opacity-90 max-w-[38ch] text-[rgb(90,62,40)]">
          Compare les meilleurs groupes par région ou par catégorie de travail
        </p>
      </header>
    );
  }

  if (location.pathname === "/settings") {
    return null;
  }
  return (
    <header className="pt-4 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-poopay-text">
        POOPAY
      </h1>
      <p className="mt-1 text-poopay-text/80">
        Combien tu gagnes aux toilettes au travail ?
      </p>
    </header>
  );
}
