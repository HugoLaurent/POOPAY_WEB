import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";

export default function Layout() {
  // Enforce auth on protected routes
  useAuth();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      <Header />
      <main className="flex-1 w-full px-4 py-4 max-w-3xl mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
