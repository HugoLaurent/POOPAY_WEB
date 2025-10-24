const PERIOD_ITEMS = [
  { k: "week", label: "Cette semaine" },
  { k: "month", label: "Ce mois-ci" },
  { k: "last", label: "Mois derniers" },
];

export default function PeriodChips({ period, setPeriod }) {
  return (
    <div className="px-4 mt-2 flex gap-2">
      {PERIOD_ITEMS.map((item) => {
        const isActive = period === item.k;
        return (
          <button
            key={item.k}
            onClick={() => setPeriod(item.k)}
            className={[
              "px-4 py-2 rounded-xl text-sm font-semibold transition border",
              isActive
                ? "bg-[#8B4513] text-white border-[#8B4513]"
                : "bg-[rgba(139,69,19,0.06)] text-[rgb(90,62,40)] border-[rgba(139,69,19,0.15)] hover:bg-[rgba(139,69,19,0.12)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
