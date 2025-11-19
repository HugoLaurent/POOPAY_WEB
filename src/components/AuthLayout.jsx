// AuthLayout.jsx
import { Outlet } from "react-router-dom";
import LegalLinks from "./LegalLinks.jsx";
import { useTheme } from "@/hooks";

export default function AuthLayout() {
  useTheme(); // apply HTML theme class on entry

  return (
    <div className="min-h-screen bg-poopay-bg flex flex-col">
      <main className="flex-1 flex items-center justify-center px-5">
        <Outlet />
      </main>
      <LegalLinks className="px-5 pb-6" />
    </div>
  );
}
