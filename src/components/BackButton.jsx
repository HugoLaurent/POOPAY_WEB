import { useNavigate } from "react-router-dom";

const combineClasses = (...classes) => classes.filter(Boolean).join(" ").trim();

export default function BackButton({ label = "Retour", fallback = "/", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={combineClasses(
        "inline-flex items-center gap-2 text-sm font-medium text-poopay-text/80 hover:text-poopay-text transition",
        className
      )}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}
