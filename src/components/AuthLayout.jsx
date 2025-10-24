// AuthLayout.jsx
import { Outlet } from "react-router-dom";
import { useTheme } from "@/hooks";

export default function AuthLayout() {
  useTheme(); // apply HTML theme class on entry

  return (
    <main className="min-h-screen bg-poopay-bg flex items-center justify-center px-5">
      <Outlet />
    </main>
  );
}
