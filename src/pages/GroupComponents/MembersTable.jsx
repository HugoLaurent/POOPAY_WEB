import { euro } from "./utils";

export default function MembersTable({ members }) {
  if (!members || members.length === 0) {
    return (
      <div className="rounded-xl bg-poopay-card/60 px-4 py-8 text-center text-sm text-poopay-mute">
        Aucun membre pour le moment.
      </div>
    );
  }

  const sorted = [...members].sort(
    (a, b) => (b.totalEarned || 0) - (a.totalEarned || 0)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
      <table className="min-w-full divide-y divide-black/10 dark:divide-white/10 text-sm">
        <thead className="bg-poopay-card/60">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-poopay-text">
              Membre
            </th>
            <th className="px-4 py-3 text-right font-semibold text-poopay-text">
              Gains
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10 dark:divide-white/10">
          {sorted.map((member) => (
            <tr key={member.id || member.email || member.name}>
              <td className="px-4 py-3 text-poopay-text font-medium">
                {member.name || member.email || "Membre"}
              </td>
              <td className="px-4 py-3 text-right text-poopay-text/80">
                {euro(member.totalEarned)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
