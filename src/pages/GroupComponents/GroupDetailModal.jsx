import { SimpleModal } from "@/components";
import MembersTable from "./MembersTable";
import { formatDate } from "./utils";

export default function GroupDetailModal({ group, isOpen, onClose }) {
  const createdDate = formatDate(group?.createdAt);

  return (
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
                Membres : {group?.members?.length ?? 0}/{group?.max_members ?? 0}
              </span>
              {group?.createdAt && createdDate && (
                <span>Cree le {createdDate}</span>
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
            className="w-full rounded-xl border border-[#8B4513] bg-[#8B4513] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#72380f]"
          >
            Inviter des membres
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-black/10 bg-poopay-card px-4 py-3 text-sm font-semibold text-poopay-text transition hover:bg-poopay-card/80"
          >
            Quitter le groupe
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}
