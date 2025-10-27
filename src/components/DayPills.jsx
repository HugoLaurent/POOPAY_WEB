import { memo } from "react";

export const DayPills = memo(function DayPills({
  days,
  activeIndex,
  setActiveIndex,
}) {
  return (
    <div className="flex justify-around items-center px-2 pb-1 pt-2">
      {days.map((day, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={`${day.label}-${day.date.toISOString()}`} // évite les collisions de fin de mois
            className={[
              "flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-full",
              active
                ? "bg-poopay-active text-white shadow-soft"
                : "bg-poopay-pill text-poopay-text/70",
            ].join(" ")}
            onClick={() => setActiveIndex(i)}
            aria-label={`${day.label} ${day.date.getDate()}`}
          >
            <span className="text-[11px] leading-none">{day.label}</span>
            <span className="mt-0.5 font-semibold">{day.date.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
});
