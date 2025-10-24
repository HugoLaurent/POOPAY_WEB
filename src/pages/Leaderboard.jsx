import React, { useState, useEffect } from "react";
import { ClassementFetch } from "@/api/api";
import ChipsFilter from "@/components/ChipsFilter";

const fmtEuro = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(n)
    : "—";

export default function Leaderboard() {
  const [mode, setMode] = useState("region"); // "region" | "category"
  const [filter, setFilter] = useState(""); // ex: "976" ou "34"

  // Défauts utilisateur (région / catégorie)
  const [defaults, setDefaults] = useState({ region: "", category: "" });
  const [bootstrapped, setBootstrapped] = useState(false);

  // Données du classement
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1️⃣ Bootstrap : récupère dataUser et premier classement
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ClassementFetch.getStats();

        // Valeurs par défaut issues de dataUser
        const du = res?.dataUser;
        const nextDefaults = {
          region: du?.userRegion ? String(du.userRegion) : "",
          category: du?.userCategoryId ? String(du.userCategoryId) : "",
        };
        if (alive) setDefaults(nextDefaults);

        // Définit le mode et filtre initiaux
        if (alive && !filter) {
          if (nextDefaults.region) {
            setMode("region");
            setFilter(nextDefaults.region);
          } else if (nextDefaults.category) {
            setMode("category");
            setFilter(nextDefaults.category);
          }
        }

        // Premier classement (si renvoyé par l'API)
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rankings)
          ? res.rankings
          : Array.isArray(res?.classementData)
          ? res.classementData
          : [];
        if (alive) setTopUsers(list);
      } catch {
        if (alive) setError("Impossible de charger les classements.");
      } finally {
        if (alive) {
          setBootstrapped(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2️⃣ Rafraîchit quand on change de mode ou de filtre
  useEffect(() => {
    if (!bootstrapped) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ClassementFetch.getStats({ mode, filter });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rankings)
          ? res.rankings
          : Array.isArray(res?.classementData)
          ? res.classementData
          : [];
        if (alive) setTopUsers(list);
      } catch {
        if (alive) setError("Impossible de charger les classements.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [bootstrapped, mode, filter]);

  return (
    <div className="min-h-[100svh] bg-transparent">
      <div className="max-w-screen-md mx-auto">
        {/* Filtres */}
        <ChipsFilter
          initialMode={mode}
          initialSelected={filter}
          defaultKeys={defaults}
          onChange={(m, s) => {
            setMode(m);
            setFilter(s);
          }}
        />

        {/* Liste */}
        <section className="px-4 pt-3 pb-6">
          {loading ? (
            <p className="text-center text-sm text-[rgb(90,62,40)] py-5">
              Chargement des classements...
            </p>
          ) : error ? (
            <p className="text-center text-sm text-[rgb(90,62,40)] py-5">
              {error}
            </p>
          ) : topUsers.length === 0 ? (
            <p className="text-center text-sm text-[rgb(90,62,40)] py-5">
              Aucun utilisateur pour ce filtre.
            </p>
          ) : (
            <ul className="space-y-2">
              {topUsers.map((u, idx) => (
                <li
                  key={`${u.id ?? u.username ?? idx}-${idx}`}
                  className="mx-3 mt-3 rounded-3xl bg-poopay-card shadow-soft px-5 py-4 flex items-center"
                >
                  <span className="w-8 font-bold text-poopay-mute">
                    {u.rank ?? idx + 1}.
                  </span>
                  <span className="flex-1 ml-2 font-semibold text-poopay-text truncate">
                    {u.username ?? u.name ?? "—"}
                  </span>
                  <span className="ml-3 font-semibold text-poopay-text">
                    {fmtEuro(Number(u.totalEarned ?? 0))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
