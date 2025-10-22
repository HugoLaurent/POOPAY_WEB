import { Link, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
export function TabLink({ to, label, Icon }) {
  const { pathname } = useLocation();
  const active =
    pathname === to || (to !== "/" && pathname.startsWith(to + "/"));

  return (
    <Link
      to={to}
      aria-label={label}
      className={`flex flex-col items-center justify-center transition-all ${
        active
          ? "opacity-100 text-poopay-active"
          : "opacity-80 hover:opacity-100"
      }`}
    >
      {/* 👇 IMPORTANT : on UTILISE bien Icon ici, donc plus d’avertissement */}
      <Icon size={22} strokeWidth={2.25} className="mb-0.5" />
      <span className="text-[12px] leading-none">{label}</span>
    </Link>
  );
}
