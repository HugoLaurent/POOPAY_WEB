import { useMemo } from "react";
import { Link } from "react-router-dom";

// utilitaires courts
const fmtH = (h) => `${h.toFixed(1)}h`;
const euro = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

// ✨ composant carte 3 colonnes (Sessions / Gagné / Temps passé)
function StatRow({ title, sessions, earned, hours }) {
  return (
    <section className="mb-4">
      <h3 className="px-4 mb-2 text-[15px] font-semibold text-poopay-text">
        {title}
      </h3>
      <div className="mx-2 rounded-3xl bg-poopay-card shadow-soft px-5 py-6">
        <div className="grid grid-cols-3 text-center">
          <div>
            <div className="text-2xl font-semibold text-poopay-text">
              {sessions}
            </div>
            <div className="text-[13px] text-poopay-mute mt-1">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-poopay-text">
              {euro(earned)}
            </div>
            <div className="text-[13px] text-poopay-mute mt-1">Gagné</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-poopay-text">
              {fmtH(hours)}
            </div>
            <div className="text-[13px] text-poopay-mute mt-1">Temps passé</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// pastilles de jours (ex : mer → mar)
function DayPills({ activeIndex = 6 }) {
  const days = useMemo(() => {
    const labels = ["Mer", "Jeu", "Ven", "Sam", "Dim", "Lun", "Mar"];
    const dates = ["24", "25", "26", "27", "28", "29", "30"];
    return labels.map((l, i) => ({ label: l, date: dates[i] }));
  }, []);
  return (
    <div className="flex items-center gap-3 overflow-x-auto px-2 pb-1 pt-2">
      {days.map((d, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={d.date}
            className={[
              "flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-full",
              active
                ? "bg-poopay-active text-white shadow-soft"
                : "bg-poopay-pill text-poopay-text/70",
            ].join(" ")}
          >
            <span className="text-[11px] leading-none">{d.label}</span>
            <span className="mt-0.5 font-semibold">{d.date}</span>
          </button>
        );
      })}
    </div>
  );
}

// item classement
function RankItem({ left, right, medal }) {
  const medalEmoji = { 1: "🥇", 2: "🥈", 3: "🥉" }[medal] ?? "🏅";
  return (
    <div className="mx-2 mb-3 rounded-3xl bg-poopay-card shadow-soft px-5 py-4 flex items-center justify-between">
      <div className="text-poopay-text/90">{left}</div>
      <div className="text-poopay-text/90">
        {right} <span className="ml-1">{medalEmoji}</span>
      </div>
    </div>
  );
}

export default function Home() {
  // 🚩 données mock pour illustrer le style (branche tes vraies stats quand tu veux)
  const today = { sessions: 3, earned: 18, hours: 0.2 };
  const week = { sessions: 5, earned: 30, hours: 0.4 };
  const month = { sessions: 30, earned: 204, hours: 3.9 };
  const leaders = [
    { left: "D'Amore Group", right: "Tiara.Effertz21", medal: 1 },
    { left: "—", right: "Estella_Stiedemann", medal: 2 },
    { left: "—", right: "Eliseo_Medhurst40", medal: 3 },
    {
      left: "Hermann, Wintheiser and Vandervort",
      right: "Jaden_Halvorson",
      medal: 1,
    },
    { left: "—", right: "Geo_Parker9", medal: 2 },
    { left: "—", right: "Davonte.Reynolds", medal: 3 },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-24">
      {/* strip de jours */}
      <DayPills />

      {/* blocs stats */}
      <div className="mt-4">
        <StatRow
          title="Aujourd'hui"
          sessions={today.sessions}
          earned={today.earned}
          hours={today.hours}
        />
        <StatRow
          title="Cette semaine"
          sessions={week.sessions}
          earned={week.earned}
          hours={week.hours}
        />
        <StatRow
          title="Ce mois-ci"
          sessions={month.sessions}
          earned={month.earned}
          hours={month.hours}
        />
      </div>

      {/* classement */}
      <section className="mt-4">
        <h3 className="px-4 mb-2 text-[15px] font-semibold text-poopay-text">
          Classement de la semaine
        </h3>
        {leaders.map((l, idx) => (
          <RankItem key={idx} left={l.left} right={l.right} medal={l.medal} />
        ))}
      </section>

      {/* mini footer conformité (facultatif) */}
      <div className="text-center text-[12px] text-poopay-mute mt-6">
        <Link to="/privacy" className="underline">
          Confidentialité
        </Link>{" "}
        ·{" "}
        <Link to="/cookies" className="underline">
          Cookies
        </Link>{" "}
        ·{" "}
        <Link to="/contact-dpo" className="underline">
          DPO
        </Link>
      </div>
    </div>
  );
}
