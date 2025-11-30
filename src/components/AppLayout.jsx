import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import LegalLinks from "./LegalLinks.jsx";
import { useAuth } from "@/hooks";

export default function Layout() {
  // Enforce auth on protected routes
  useAuth();
  const { pathname } = useLocation();
  const shouldShowFooter = pathname !== "/timer";

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      <Header />
      <main className="flex-1 w-full px-4 py-4 max-w-3xl mx-auto">
        <Outlet />
        {!shouldShowFooter && <LegalLinks className="mt-8" />}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}
