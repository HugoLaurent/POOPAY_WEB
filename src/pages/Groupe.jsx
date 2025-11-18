// src/pages/Groups.jsx
import { useEffect, useState } from "react";
import { SimpleModal, Toast } from "@/components";
import { GroupsFetch } from "@/api";
import { PeriodChips, GroupCard, GroupDetailModal } from "./GroupComponents";
import { useAuthContext } from "@/context/AuthContext";

function normalizeGroupsResponse(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.groups)) return res.groups;
  if (Array.isArray(res)) return res;
  return [];
}

export default function Groups() {
  const { user } = useAuthContext();
  const isPremium = Boolean(user?.isPremium);
  const defaultMaxMembers = isPremium ? "10" : "3";
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [groups, setGroups] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createMaxMembers, setCreateMaxMembers] = useState(defaultMaxMembers);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "success",
  });

  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setCreateMaxMembers(defaultMaxMembers);
    }
  }, [defaultMaxMembers, isCreateModalOpen]);

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
        console.log(payload);
      } catch (error) {
        console.error(error);
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
    } catch (error) {
      console.error(error);
    }
  }

  function resetCreateForm() {
    setCreateName("");
    setCreateDescription("");
    setCreateMaxMembers(defaultMaxMembers);
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
        "Le nombre maximal doit être un entier supérieur ou égal à 2."
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
      const created = await GroupsFetch.createGroup(payload);

      if (created && typeof created === "object") {
        const hydrated = {
          name: payload.name,
          max_members: payload.max_members,
          description: payload.description,
          members: [],
          ...created,
        };
        setGroups((prev) => [hydrated, ...prev]);
      }

      await refreshGroups();

      setToast({
        isOpen: true,
        message: "Le groupe a été créé avec succès.",
        variant: "success",
      });
      handleCloseCreateModal();
    } catch (error) {
      console.error(error);
      setCreateError(
        error?.message || "Impossible de créer le groupe pour le moment."
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
          Créer un groupe
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
        <p className="px-4 mt-6 text-poopay-mute">Aucun groupe trouvé.</p>
      )}

      {!loading &&
        !err &&
        groups.map((group) => (
          <GroupCard
            key={group.id || group.name}
            group={group}
            onOpen={setSelectedGroup}
          />
        ))}

      <GroupDetailModal
        group={selectedGroup}
        isOpen={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
        onInviteSuccess={(groupName) => {
          setToast({
            isOpen: true,
            message: `Invitation envoyée pour "${groupName}".`,
            variant: "success",
          });
        }}
        onLeaveSuccess={async (groupName) => {
          await refreshGroups();
          setSelectedGroup(null);
          setToast({
            isOpen: true,
            message: `Tu as quitté le groupe "${groupName}".`,
            variant: "success",
          });
        }}
      />

      <SimpleModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        className="rounded-t-3xl"
      >
        <form onSubmit={handleCreateGroup} className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-poopay-text">
              Créer un groupe
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
                  Le nombre maximum de membres autorisés dans ce groupe est de
                  3, passe en mode premium pour le monter à 10 !
                </p>
              )}
            </label>

            <label className="block text-sm font-medium text-poopay-text">
              Description (optionnel)
              <textarea
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-poopay-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                rows={4}
                placeholder="Une courte description du groupe"
              />
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
              {createLoading ? "Création..." : "Valider"}
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
