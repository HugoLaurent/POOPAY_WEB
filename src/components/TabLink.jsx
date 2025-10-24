import { Link, useLocation } from "react-router-dom";

export function TabLink({ to, label, Icon, variant = "default" }) {
  const { pathname } = useLocation();
  const active =
    pathname === to || (to !== "/" && pathname.startsWith(to + "/"));

  const isPrimary = variant === "primary";
  const baseClasses = isPrimary
    ? "relative flex items-center justify-center w-[80px] h-[80px] rounded-full border-4 border-poopay-card text-white shadow-[0_16px_36px_rgba(124,84,56,0.32)] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poopay-active/40 z-10 transform -translate-y-[42%]"
    : "flex flex-col items-center justify-center gap-0.5 h-full w-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poopay-active/40";
  const stateClasses = isPrimary
    ? active
      ? "bg-poopay-active"
      : "bg-poopay-active/95 hover:scale-115"
    : active
    ? "opacity-100 text-poopay-active"
    : "opacity-80 hover:opacity-100";

  if (isPrimary) {
    return (
      <Link
        to={to}
        aria-label={label}
        className={`${baseClasses} ${stateClasses}`}
      >
        <Icon size={40} strokeWidth={2.4} />
        <span className="sr-only">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      aria-label={label}
      className={`${baseClasses} ${stateClasses}`}
    >
      <Icon size={22} strokeWidth={2.25} />
      <span className="text-[12px] leading-none">{label}</span>
    </Link>
  );
}
