// src/pages/Groups.jsx
import { useEffect, useMemo, useState } from "react";
import SimpleModal from "../components/SimpleModal";
import { GroupsFetch } from "../api/api";
import Toast from "../components/Toast";

// Helpers
const euro = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const MEDAL = ["#1", "#2", "#3"];

function normalizeGroupsResponse(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.groups)) return res.groups;
  if (Array.isArray(res)) return res;
  return [];
}

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
      <div className="flex items-start justify-between">
        <h3 className="text-[17px] font-semibold text-poopay-text">{g.name}</h3>
        <div className="text-[12px] text-poopay-mute">
          {g.members?.length ?? 0} / {g.max_members}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-[12px]">
        <span className="text-poopay-mute">Gagnant du mois dernier :</span>
        <span className="text-poopay-text truncate max-w-[55%] text-right">
          {g.winnerLastMonth?.name || "Inconnu"}
        </span>
      </div>
      <div className="mt-1 text-[12px] text-poopay-mute">
        Ta position :{" "}
        {g.userPlace ? (
          <span className="text-poopay-text font-medium">{g.userPlace}</span>
        ) : (
          "Inconnue"
        )}
      </div>

      <div className="mt-3 space-y-2">
        {top.map((m, i) => (
          <div
            key={m.id ?? i}
            className="flex items-center justify-between text-[15px]"
          >
            <div className="text-poopay-text/90">
              <span className="mr-1">{MEDAL[i] || "#"}</span>
              <span className="font-medium">{m.name}</span>
            </div>
            <div className="text-poopay-text/80">{euro(m.totalEarned)}</div>
          </div>
        ))}

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
  const isPremium = localStorage.getItem("isPremium") === "true";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createMaxMembers, setCreateMaxMembers] = useState(
    isPremium ? "10" : "3"
  );
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "success",
  });
  useEffect(() => {
    let cancelled = false;

    async function fetchGroups() {
      setLoading(true);
      setErr("");
      try {
        const res = await GroupsFetch.getGroups({ period });
        const payload = normalizeGroupsResponse(res);
        if (!cancelled) {
          setGroups(payload);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Impossible de charger les groupes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGroups();

    return () => {
      cancelled = true;
    };
  }, [period]);

  async function refreshGroups() {
    try {
      const res = await GroupsFetch.getGroups({ period });
      const payload = normalizeGroupsResponse(res);
      setGroups(payload);
    } catch (e) {
      console.error(e);
    }
  }

  function resetCreateForm() {
    setCreateName("");
    setCreateDescription("");
    setCreateMaxMembers("10");
    setCreateError("");
  }

  function handleOpenCreateModal() {
    setIsCreateModalOpen(true);
  }

  function handleCloseCreateModal() {
    if (createLoading) return;
    setIsCreateModalOpen(false);
    resetCreateForm();
  }

  async function handleCreateGroup(event) {
    event.preventDefault();
    if (createLoading) return;

    const trimmedName = createName.trim();
    if (!trimmedName) {
      setCreateError("Le nom du groupe est requis.");
      return;
    }

    const parsedMax = Number.parseInt(createMaxMembers, 10);
    if (!Number.isFinite(parsedMax) || parsedMax < 2) {
      setCreateError(
        "Le nombre maximal doit etre un entier superieur ou egal a 2."
      );
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    try {
      const payload = {
        name: trimmedName,
        max_members: parsedMax,
        description: createDescription.trim() || undefined,
      };
      await GroupsFetch.createGroup(payload);

      await refreshGroups();

      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Le groupe a été créé avec succès.",
        variant: "success",
      });
      resetCreateForm();
    } catch (e) {
      console.error(e);
      setCreateError(
        e?.message || "Impossible de creer le groupe pour le moment."
      );
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-poopay-bg pb-28">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-poopay-text">
          Mes Groupes
        </h1>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition border bg-[#8B4513] text-white border-[#8B4513]"
        >
          Creer un groupe
        </button>
      </div>

      <PeriodChips period={period} setPeriod={setPeriod} />

      {loading && (
        <div className="flex items-center justify-center py-14 text-poopay-mute">
          <span className="animate-pulse">Chargement...</span>
        </div>
      )}
      {err && !loading && (
        <div className="flex items-center justify-center py-14 text-red-500">
          {err}
        </div>
      )}

      {!loading && !err && groups.length === 0 && (
        <p className="px-4 mt-6 text-poopay-mute">Aucun groupe trouve.</p>
      )}

      {!loading && !err && groups.map((g) => <GroupCard key={g.id} g={g} />)}

      <SimpleModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        className="rounded-t-3xl"
      >
        <form onSubmit={handleCreateGroup} className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-poopay-text">
              Creer un groupe
            </h2>
            <button
              type="button"
              onClick={handleCloseCreateModal}
              className="text-sm text-poopay-mute hover:text-poopay-text transition"
            >
              Fermer
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-poopay-text">
              Nom du groupe
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-poopay-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Nom de ton groupe"
              />
            </label>

            <label className="block text-sm font-medium text-poopay-text">
              Nombre maximal de membres
              <input
                type="number"
                min="2"
                value={createMaxMembers}
                onChange={(event) => setCreateMaxMembers(event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-poopay-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              {!isPremium && (
                <p className="mt-1 text-sm text-poopay-mute">
                  Le nombre maximum de membres autorises dans ce groupe est de
                  3, passez en mode premium pour le monter à 10!
                </p>
              )}
            </label>
          </div>

          {createError && <p className="text-sm text-red-500">{createError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseCreateModal}
              className="px-4 py-2 rounded-xl text-sm font-medium text-poopay-text bg-poopay-card/70 border border-black/10 hover:bg-poopay-card/90 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#8B4513] border border-[#8B4513] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createLoading ? "Creation..." : "Valider"}
            </button>
          </div>
        </form>
      </SimpleModal>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
