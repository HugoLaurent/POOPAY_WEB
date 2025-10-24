import { useMemo } from "react";
import { euro, MEDAL } from "./utils";

export default function GroupCard({ group, onOpen }) {
  const sorted = useMemo(
    () =>
      [...(group.members || [])].sort(
        (a, b) => (b.totalEarned || 0) - (a.totalEarned || 0)
      ),
    [group.members]
  );
  const top = sorted.slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onOpen(group)}
      className="w-full text-left"
    >
      <div className="mx-3 mt-3 rounded-3xl bg-poopay-card shadow-soft px-5 py-4 transition hover:shadow-lg">
        <div className="flex items-start justify-between">
          <h3 className="text-[17px] font-semibold text-poopay-text">
            {group.name}
          </h3>
          <div className="text-[12px] text-poopay-mute">
            {group.members?.length ?? 0} / {group.max_members}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-[12px]">
          <span className="text-poopay-mute">Gagnant du mois dernier :</span>
          <span className="text-poopay-text truncate max-w-[55%] text-right">
            {group.winnerLastMonth?.name || "Inconnu"}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-poopay-mute">
          Ta position :{" "}
          {group.userPlace ? (
            <span className="text-poopay-text font-medium">
              {group.userPlace}
            </span>
          ) : (
            "Inconnue"
          )}
        </div>

        <div className="mt-3 space-y-2">
          {top.map((member, index) => (
            <div
              key={member.id ?? `${member.name}-${index}`}
              className="flex items-center justify-between text-[15px]"
            >
              <div className="text-poopay-text/90">
                <span className="mr-1">{MEDAL[index] || "#"}</span>
                <span className="font-medium">{member.name}</span>
              </div>
              <div className="text-poopay-text/80">
                {euro(member.totalEarned)}
              </div>
            </div>
          ))}

          {sorted.slice(3, 3).map((member, index) => (
            <div
              key={`rest-${member.id ?? `${member.name}-${index}`}`}
              className="flex items-center justify-between text-[15px]"
            >
              <div className="text-poopay-mute">{member.name}</div>
              <div className="text-poopay-mute">{euro(member.totalEarned)}</div>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
