import { useMemo, useState } from "react";

import { SimpleModal } from "@/components";
import { GroupsFetch } from "@/api";
import MembersTable from "./MembersTable";
import { formatDate } from "./utils";

export default function GroupDetailModal({
  group,
  isOpen,
  onClose,
  onInviteSuccess,
  onLeaveSuccess,
}) {
  const createdDate = formatDate(group?.createdAt);
  const canInvite = Boolean(group?.isAdmin);
  const isAdmin = Boolean(group?.isAdmin);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const memberCount = useMemo(
    () => group?.members?.length ?? 0,
    [group?.members?.length]
  );

  const handleOpenInvite = () => {
    if (!canInvite) return;
    setIsInviteModalOpen(true);
    setInviteError("");
  };

  const handleCloseInvite = ({ force = false } = {}) => {
    if (inviteLoading && !force) return;
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteMessage("");
    setInviteError("");
  };

  const handleSubmitInvite = async (event) => {
    event.preventDefault();
    if (!group?.id) return;
    const trimmedEmail = inviteEmail.trim();

    if (!trimmedEmail) {
      setInviteError("L'email du membre est requis.");
      return;
    }

    setInviteLoading(true);
    setInviteError("");

    try {
      const response = await GroupsFetch.inviteMember(group.id, {
        email: trimmedEmail,
        message: inviteMessage.trim() || undefined,
      });

      setInviteEmail("");
      setInviteMessage("");
      handleCloseInvite({ force: true });
      onInviteSuccess?.(
        response?.notification?.data?.groupName ||
          response?.notification?.invitation?.group?.name ||
          group?.name ||
          "Groupe"
      );
    } catch (err) {
      setInviteError(err?.message || "Impossible d'envoyer l'invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group?.id || isAdmin || leaveLoading) return;
    if (
      !window.confirm(
        `Veux-tu vraiment quitter le groupe "${group?.name || "Groupe"}" ?`
      )
    ) {
      return;
    }
    setLeaveLoading(true);
    setLeaveError("");
    try {
      await GroupsFetch.leaveGroup(group.id);
      onLeaveSuccess?.(group?.name || "Groupe");
      onClose?.();
    } catch (err) {
      setLeaveError(err?.message || "Impossible de quitter le groupe.");
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <>
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        className="rounded-t-3xl"
        closeOnBackdrop={true}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-poopay-text">
                {group?.name || "Groupe"}
              </h2>
              <p className="text-sm text-poopay-mute mt-1">
                {group?.description || "Aucune description fournie."}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-poopay-mute">
                <span>
                  Membres : {memberCount}/{group?.max_members ?? 0}
                </span>
                {group?.createdAt && createdDate && (
                  <span>cree le {createdDate}</span>
                )}
                {group?.winnerLastMonth?.name && (
                  <span>
                    Gagnant du mois dernier : {group.winnerLastMonth.name}
                  </span>
                )}
                {group?.category && <span>Categorie : {group.category}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-poopay-mute hover:text-poopay-text transition"
            >
              Fermer
            </button>
          </div>

          <MembersTable members={group?.members || []} />

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleOpenInvite}
              disabled={!canInvite}
              className="w-full rounded-xl border border-[#8B4513] bg-[#8B4513] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#72380f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Inviter des membres
            </button>
            <button
              type="button"
              onClick={handleLeaveGroup}
              disabled={isAdmin || leaveLoading}
              className="w-full rounded-xl border border-black/10 bg-poopay-card px-4 py-3 text-sm font-semibold text-poopay-text transition hover:bg-poopay-card/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {leaveLoading ? "Quitte..." : "Quitter le groupe"}
            </button>
          </div>
          {leaveError && (
            <p className="text-sm text-red-500">{leaveError}</p>
          )}
          {!canInvite && (
            <p className="text-xs text-poopay-mute">
              Seul l'administrateur du groupe peut inviter de nouveaux membres.
            </p>
          )}
          {isAdmin && (
            <p className="text-xs text-poopay-mute">
              Tu es administrateur et ne peux pas quitter ce groupe.
            </p>
          )}
        </div>
      </SimpleModal>

      <SimpleModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInvite}
        className="rounded-t-3xl"
        closeOnBackdrop={!inviteLoading}
      >
        <form onSubmit={handleSubmitInvite} className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-poopay-text">
              Inviter un membre
            </h3>
            <button
              type="button"
              onClick={handleCloseInvite}
              className="text-sm text-poopay-mute hover:text-poopay-text transition"
              disabled={inviteLoading}
            >
              Fermer
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-poopay-text">
              Email du membre
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                type="email"
                placeholder="email@example.com"
                className="mt-1 w-full rounded-xl border border-black/10 bg-poopay-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                disabled={inviteLoading}
              />
            </label>
            <label className="block text-sm font-medium text-poopay-text">
              Message (optionnel)
              <textarea
                value={inviteMessage}
                onChange={(event) => setInviteMessage(event.target.value)}
                rows={3}
                placeholder="Ajoute un message pour ton invite"
                className="mt-1 w-full rounded-xl border border-black/10 bg-poopay-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                disabled={inviteLoading}
              />
            </label>
          </div>

          {inviteError && (
            <p className="text-sm text-red-500">{inviteError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseInvite}
              className="px-4 py-2 rounded-xl text-sm font-medium text-poopay-text bg-poopay-card/70 border border-black/10 hover:bg-poopay-card/90 transition"
              disabled={inviteLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={inviteLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#8B4513] border border-[#8B4513] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {inviteLoading ? "Envoi..." : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </SimpleModal>
    </>
  );
}
