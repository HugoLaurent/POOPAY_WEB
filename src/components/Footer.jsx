import { Home, Trophy, Users, Settings } from "lucide-react";
import { TabLink } from "./TabLink";

/** Onglets de la barre */
const TABS = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/leaderboard", label: "Classement", Icon: Trophy },
  { to: "/group", label: "Groupe", Icon: Users },
  { to: "/settings", label: "Réglages", Icon: Settings },
];

export default function Footer() {
  return (
    <footer className="mt-12  max-w-3xl mx-auto w-full">
      <nav className="fixed rounded-t-lg bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-16 bg-poopay-card/95 backdrop-blur supports-backdrop-filter]:bg-poopay-card/80 shadow-[0_-6px_20px_rgba(124,84,56,.08)]">
        <ul className="h-full grid grid-cols-4 text-center text-poopay-text/80">
          {TABS.map(({ to, label, Icon }) => (
            <li key={to} className="flex flex-col items-center justify-center">
              <TabLink to={to} label={label} Icon={Icon} />
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
