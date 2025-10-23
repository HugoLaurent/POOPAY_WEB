// src/pages/Groups.jsx
import { useEffect, useMemo, useState } from "react";
import { GroupsFetch } from "../api/api";
import { Link } from "react-router-dom";

// Helpers
const euro = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const MEDAL = ["🥇", "🥈", "🥉"];

function PeriodChips({ period, setPeriod }) {
  const items = [
    { k: "week", label: "Cette semaine" },
    { k: "month", label: "Ce mois-ci" },
    { k: "last", label: "Mois derniers" },
  ];

  return (
    <div className="px-4 mt-2 flex gap-2">
      {items.map((it) => {
        const isActive = period === it.k;
        return (
          <button
            key={it.k}
            onClick={() => setPeriod(it.k)}
            className={[
              "px-4 py-2 rounded-xl text-sm font-semibold transition border",
              isActive
                ? "bg-[#8B4513] text-white border-[#8B4513]"
                : "bg-[rgba(139,69,19,0.06)] text-[rgb(90,62,40)] border-[rgba(139,69,19,0.15)] hover:bg-[rgba(139,69,19,0.12)]",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function GroupCard({ g }) {
  // tri garanti par gains décroissants
  const sorted = useMemo(
    () =>
      [...(g.members || [])].sort(
        (a, b) => (b.totalEarned || 0) - (a.totalEarned || 0)
      ),
    [g.members]
  );
  const top = sorted.slice(0, 3);

  return (
    <div className="mx-3 mt-3 rounded-3xl bg-poopay-card shadow-soft px-5 py-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-[17px] font-semibold text-poopay-text">{g.name}</h3>
        <div className="text-[12px] text-poopay-mute">
          {g.members?.length ?? 0} / {g.max_members}
        </div>
      </div>

      {/* Subheader gagnant + position user */}
      <div className="mt-1 flex items-center justify-between text-[12px]">
        <span className="text-poopay-mute">Gagnant du mois dernier :</span>
        <span className="text-poopay-text truncate max-w-[55%] text-right">
          {g.winnerLastMonth?.name || "—"}
        </span>
      </div>
      <div className="mt-1 text-[12px] text-poopay-mute">
        Ta position :{" "}
        {g.userPlace ? (
          <span className="text-poopay-text font-medium">{g.userPlace}ᵉ</span>
        ) : (
          "—"
        )}
      </div>

      {/* Liste top 3 */}
      <div className="mt-3 space-y-2">
        {top.map((m, i) => (
          <div
            key={m.id ?? i}
            className="flex items-center justify-between text-[15px]"
          >
            <div className="text-poopay-text/90">
              <span className="mr-1">{MEDAL[i] || "🏅"}</span>
              <span className="font-medium">{m.name}</span>
            </div>
            <div className="text-poopay-text/80">{euro(m.totalEarned)}</div>
          </div>
        ))}

        {/* Quelques suivants en gris (optionnel) */}
        {sorted.slice(3, 6).map((m, idx) => (
          <div
            key={`rest-${m.id ?? idx}`}
            className="flex items-center justify-between text-[15px]"
          >
            <div className="text-poopay-mute">{m.name}</div>
            <div className="text-poopay-mute">{euro(m.totalEarned)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Groups() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await GroupsFetch.getGroups({ period });
        // Normalisation de la réponse : accepte {data: [...]}, {groups: [...]}, ou directement [...]
        const payload = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.groups)
          ? res.groups
          : Array.isArray(res)
          ? res
          : [];

        if (!alive) return;
        setGroups(payload);
      } catch (e) {
        console.error(e);
        if (alive) setErr("Impossible de charger les groupes.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [period]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-28">
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-poopay-text">
          Mes Groupes
        </h1>
        <Link
          to="/groups/new"
          className=" px-4 py-2 rounded-xl text-sm font-semibold transition border bg-[#8B4513] text-white border-[#8B4513]"
          aria-label="Créer un groupe"
        >
          Créer un groupe
        </Link>
      </div>

      {/* Filtres */}
      <PeriodChips period={period} setPeriod={setPeriod} />

      {/* Contenu */}
      {loading && (
        <div className="flex items-center justify-center py-14 text-poopay-mute">
          <span className="animate-pulse">Chargement…</span>
        </div>
      )}
      {err && !loading && (
        <div className="flex items-center justify-center py-14 text-red-500">
          {err}
        </div>
      )}

      {!loading && !err && groups.length === 0 && (
        <p className="px-4 mt-6 text-poopay-mute">Aucun groupe trouvé.</p>
      )}

      {!loading && !err && groups.map((g) => <GroupCard key={g.id} g={g} />)}
    </div>
  );
}
