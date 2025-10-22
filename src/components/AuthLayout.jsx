// AuthLayout.jsx
import { Outlet } from "react-router-dom";
import { useTheme } from "../hooks/useTheme"; // ⬅️ ajoute ça

export default function AuthLayout() {
  useTheme(); // ⬅️ déclenche l’effet qui applique .light/.dark sur <html>

  return (
    <main className="min-h-screen bg-poopay-bg flex items-center justify-center px-5">
      <Outlet />
    </main>
  );
}
