import { Home, Trophy, Users, Settings, Timer } from "lucide-react";
import { TabLink } from "./TabLink";

/** Onglets de la barre */
const TABS = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/leaderboard", label: "Classement", Icon: Trophy },
  { to: "/timer", label: "Timer", Icon: Timer, variant: "primary" },
  { to: "/group", label: "Groupe", Icon: Users },
  { to: "/settings", label: "Réglages", Icon: Settings },
];

export default function Footer() {
  const primaryTab = TABS.find((tab) => tab.variant === "primary");
  const secondaryTabs = TABS.filter((tab) => tab.variant !== "primary");

  return (
    <footer className="mt-12 max-w-3xl mx-auto w-full">
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-20 rounded-t-2xl bg-poopay-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-poopay-card/80 shadow-[0_-8px_24px_rgba(124,84,56,0.12)]">
        {primaryTab && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <TabLink {...primaryTab} />
          </div>
        )}
        <ul className="grid h-full grid-cols-4 items-center text-center text-poopay-text/80">
          {secondaryTabs.map(({ to, label, Icon }) => (
            <li key={to} className="flex justify-center">
              <TabLink to={to} label={label} Icon={Icon} />
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
