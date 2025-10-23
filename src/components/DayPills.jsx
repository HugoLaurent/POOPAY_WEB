import { useMemo } from "react";
export function DayPills({ activeIndex, setActiveIndex }) {
  const today = new Date();
  const days = useMemo(() => {
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - ((today.getDay() + 6) % 7) + i);
      dates.push(d.getDate());
    }
    return labels.map((l, i) => ({ label: l, date: dates[i] }));
  }, []);
  return (
    <div className="flex justify-around items-center  px-2 pb-1 pt-2">
      {days.map((day, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={day.date}
            className={[
              "flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-full",
              active
                ? "bg-poopay-active text-white shadow-soft"
                : "bg-poopay-pill text-poopay-text/70",
            ].join(" ")}
            onClick={() => setActiveIndex(i)}
            aria-label={`${day.label} ${day.date}`}
          >
            <span className="text-[11px] leading-none">{day.label}</span>
            <span className="mt-0.5 font-semibold">{day.date}</span>
          </button>
        );
      })}
    </div>
  );
}
