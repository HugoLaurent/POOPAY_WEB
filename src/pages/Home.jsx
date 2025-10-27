import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DayPills, GoogleAd } from "@/components";
import { HomeFetch } from "@/api";

const fmtH = (h) => `${h.toFixed(1)}h`;
const euro = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const LABELS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const toFrLabel = (date) => LABELS_FR[(date.getDay() + 6) % 7];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // 0..6 où 6 === aujourd'hui
  const [activeIndex, setActiveIndex] = useState(6);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await HomeFetch.getStats();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ⬇️ Les 7 jours glissants (du plus ancien au plus récent, aujourd’hui = index 6)
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push({ date: d, label: toFrLabel(d) });
    }
    return arr;
  }, []);

  // ✨ carte stats (Sessions / Gagné / Temps passé)
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
              <div className="text-[13px] text-poopay-mute mt-1">
                Temps passé
              </div>
            </div>
          </div>
        </div>
      </section>
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

  // 🧮 Statistiques du jour sélectionné via DayPills — basé sur days[activeIndex]
  const selectedDay = useMemo(() => {
    if (!data) return { sessions: 0, earned: 0, hours: 0, selectedDate: null };
    const sel = days[activeIndex]?.date;
    if (!sel) return { sessions: 0, earned: 0, hours: 0, selectedDate: null };

    const start = startOfDay(sel);
    const end = endOfDay(sel);

    const sessionsDay = data.sessions.filter((s) => {
      const t = new Date(s.startTime);
      return t >= start && t <= end;
    });

    const earned = sessionsDay.reduce(
      (sum, s) => sum + Number(s.amountEarned || 0),
      0
    );
    const seconds = sessionsDay.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );

    return {
      sessions: sessionsDay.length,
      earned,
      hours: seconds / 3600,
      selectedDate: sel,
    };
  }, [data, days, activeIndex]);

  // Cette semaine (lundi → maintenant) inchangé
  const week = useMemo(() => {
    if (!data) return { sessions: 0, earned: 0, hours: 0 };
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sessionsWeek = data.sessions.filter(
      (s) => new Date(s.startTime) >= monday
    );
    const earned = sessionsWeek.reduce(
      (sum, s) => sum + Number(s.amountEarned || 0),
      0
    );
    const seconds = sessionsWeek.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );
    return { sessions: sessionsWeek.length, earned, hours: seconds / 3600 };
  }, [data]);

  const month = useMemo(() => {
    if (!data) return { sessions: 0, earned: 0, hours: 0 };
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessionsMonth = data.sessions.filter(
      (s) => new Date(s.startTime) >= firstOfMonth
    );
    const earned = sessionsMonth.reduce(
      (sum, s) => sum + Number(s.amountEarned || 0),
      0
    );
    const seconds = sessionsMonth.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );
    return { sessions: sessionsMonth.length, earned, hours: seconds / 3600 };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-poopay-mute">
        <span className="animate-pulse">Chargement...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }
  if (!data) return null;

  // Titre du bloc "Aujourd'hui" = label + date du jour sélectionné (issu de days)
  const titleSelected = (() => {
    const d = selectedDay.selectedDate || new Date();
    const label = days[activeIndex]?.label ?? "";
    return `${label} ${d.getDate()}`;
  })();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-24">
      {/* strip de jours */}
      <DayPills
        days={days}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />

      {/* blocs stats */}
      <div className="mt-4">
        <StatRow
          title={titleSelected}
          sessions={selectedDay.sessions}
          earned={selectedDay.earned}
          hours={selectedDay.hours}
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

      <GoogleAd className="mx-2 mt-6" />

      {/* classement */}
      <section className="mt-4">
        <h3 className="px-4 mb-2 text-[15px] font-semibold text-poopay-text">
          Classement de la semaine
        </h3>

        {data.groups.map((group) => (
          <div
            key={group.id}
            className="mx-2 mb-4 rounded-3xl bg-poopay-card shadow-soft px-5 py-5"
          >
            <div className="mb-3">
              <h4 className="text-poopay-text font-semibold text-[15px]">
                {group.name}
              </h4>
              {/* Position du user */}
              <div className="text-[13px] text-poopay-mute mt-3">
                Ta position :{" "}
                {group.userPlace ? (
                  <span className="text-poopay-text font-medium">
                    {group.userPlace}ᵉ
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>

            {/* Top 3 membres du groupe */}
            <div className="space-y-2">
              {group.members.map((m, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[15px] text-poopay-text/90"
                >
                  <span>
                    {i === 0 && "🥇 "}
                    {i === 1 && "🥈 "}
                    {i === 2 && "🥉 "}
                    <span>{m.username}</span>
                  </span>
                  <span className="text-poopay-text/80">
                    {m.totalEarned.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {data.groups.length === 0 && (
          <p className="px-4 text-poopay-mute">Aucun groupe pour le moment.</p>
        )}
      </section>

      {/* footer */}
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
