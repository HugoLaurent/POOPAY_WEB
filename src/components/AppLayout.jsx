import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  // Enforce auth on protected routes
  useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />

      {/* Petit switcher temporaire (optionnel) */}
      <div className="fixed bottom-4 right-4 bg-poopay-card shadow-soft rounded-full p-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-poopay-text text-lg"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>
    </div>
  );
}
