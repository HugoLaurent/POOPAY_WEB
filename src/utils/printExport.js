function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "N/A";
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds)) return "N/A";
  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)} s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = Math.round(totalSeconds % 60);
  if (remaining === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remaining} s`;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const amount = Number(value);
  if (Number.isNaN(amount)) return escapeHtml(value);
  return `${amount.toFixed(2)} EUR`;
}

function formatBoolean(value) {
  if (value === null || value === undefined) return "N/A";
  return value ? "Oui" : "Non";
}

function buildPrintHtml(data) {
  const summaryItems = [
    { label: "Identifiant", value: data?.id },
    { label: "Nom utilisateur", value: data?.username },
    { label: "Categorie", value: data?.category?.name },
    { label: "Departement", value: data?.department?.name },
    { label: "Groupes", value: (data?.groups || []).length },
    { label: "Sessions", value: (data?.sessions || []).length },
  ]
    .map((item) => {
      const safeValue =
        item.value === null || item.value === undefined || item.value === ""
          ? "N/A"
          : escapeHtml(item.value);
      return `
        <div class="summary-item">
          <div class="summary-label">${escapeHtml(item.label)}</div>
          <div class="summary-value">${safeValue}</div>
        </div>
      `;
    })
    .join("");

  const groupsHtml =
    data?.groups && data.groups.length
      ? `<ul class="inline-list">
          ${data.groups
            .map(
              (group, index) =>
                `<li><span class="tag-index">${index + 1}.</span> ${escapeHtml(
                  group?.name || "Sans nom"
                )}</li>`
            )
            .join("")}
        </ul>`
      : '<p class="empty">Aucun groupe enregistre</p>';

  const preferencesHtml =
    data?.preferences && data.preferences.length
      ? `<ul class="inline-list">
          ${data.preferences
            .map((pref, index) => {
              if (typeof pref === "string") {
                return `<li><span class="tag-index">${index + 1}.</span> ${escapeHtml(
                  pref
                )}</li>`;
              }
              return `<li><span class="tag-index">${index + 1}.</span> ${escapeHtml(
                JSON.stringify(pref)
              )}</li>`;
            })
            .join("")}
        </ul>`
      : '<p class="empty">Aucune preference enregistree</p>';

  const subscriptions = data?.subscriptions || [];
  const subscriptionsRows = subscriptions.length
    ? subscriptions
        .map(
          (subscription, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(subscription?.status || "N/A")}</td>
            <td>${escapeHtml(subscription?.provider || "N/A")}</td>
            <td>${escapeHtml(formatDateTime(subscription?.startedAt))}</td>
            <td>${escapeHtml(formatDateTime(subscription?.currentPeriodStart))}</td>
            <td>${escapeHtml(formatDateTime(subscription?.currentPeriodEnd))}</td>
            <td>${escapeHtml(formatBoolean(subscription?.cancelAtPeriodEnd))}</td>
            <td>${escapeHtml(formatDateTime(subscription?.canceledAt))}</td>
          </tr>
        `
        )
        .join("")
    : '<tr><td class="empty" colspan="8">Aucun abonnement</td></tr>';

  const sessions = data?.sessions || [];
  const sessionsRows = sessions.length
    ? sessions
        .map(
          (session, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(formatDateTime(session?.startTime))}</td>
            <td>${escapeHtml(formatDateTime(session?.endTime))}</td>
            <td>${escapeHtml(session?.status || "N/A")}</td>
            <td>${escapeHtml(formatDuration(session?.durationSeconds))}</td>
            <td>${escapeHtml(formatCurrency(session?.amountEarned))}</td>
          </tr>
        `
        )
        .join("")
    : '<tr><td class="empty" colspan="6">Aucune session</td></tr>';

  const title = `Export des donnees - ${escapeHtml(data?.username || "Utilisateur")}`;

  return `<!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
          font-family: "Segoe UI", Arial, sans-serif;
          color: #111827;
          background: #f3f4f6;
          margin: 0;
          padding: 32px;
        }
        .container {
          max-width: 960px;
          margin: 0 auto;
          background: #ffffff;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        }
        h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.2;
          text-align: center;
          color: #0f172a;
        }
        .subtitle {
          margin: 6px 0 24px 0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        section + section {
          margin-top: 32px;
        }
        .section-title {
          margin: 0 0 14px 0;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 12px;
          color: #0369a1;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .summary-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .summary-label {
          font-size: 11px;
          letter-spacing: 0.04em;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .summary-value {
          font-size: 16px;
          color: #0f172a;
          font-weight: 600;
        }
        .inline-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .inline-list li {
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 9px;
          padding: 8px 10px;
          font-size: 13px;
          color: #312e81;
        }
        .tag-index {
          display: inline-block;
          margin-right: 6px;
          font-weight: 600;
          color: #4338ca;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          vertical-align: top;
        }
        th {
          background: #eff6ff;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 11px;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }
        .empty {
          padding: 16px 0;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }
        @media print {
          body {
            background: #ffffff;
            padding: 12px;
          }
          .container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Export des donnees utilisateur</h1>
        <p class="subtitle">Generation le ${escapeHtml(
          formatDateTime(new Date().toISOString())
        )}</p>

        <section>
          <p class="section-title">Synthese</p>
          <div class="summary-grid">
            ${summaryItems}
          </div>
        </section>

        <section>
          <p class="section-title">Groupes</p>
          ${groupsHtml}
        </section>

        <section>
          <p class="section-title">Preferences</p>
          ${preferencesHtml}
        </section>

        <section>
          <p class="section-title">Abonnements</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Statut</th>
                <th>Fournisseur</th>
                <th>Debut</th>
                <th>Periode actuelle</th>
                <th>Fin de periode</th>
                <th>Annulation programmee</th>
                <th>Date d'annulation</th>
              </tr>
            </thead>
            <tbody>
              ${subscriptionsRows}
            </tbody>
          </table>
        </section>

        <section>
          <p class="section-title">Sessions</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Debut</th>
                <th>Fin</th>
                <th>Statut</th>
                <th>Duree</th>
                <th>Gain</th>
              </tr>
            </thead>
            <tbody>
              ${sessionsRows}
            </tbody>
          </table>
        </section>
      </div>
    </body>
  </html>`;
}

export function openPrintWindow(data) {
  const html = buildPrintHtml(data);
  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (!printWindow) {
    console.error(
      "Impossible d'ouvrir la fenetre d'impression. Autorisez les fenetres pop-up puis reessayez."
    );
    return false;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => {
    printWindow.close();
  };
  setTimeout(() => {
    try {
      printWindow.print();
    } catch (err) {
      console.error("Echec de l'impression :", err);
    }
  }, 200);
  return true;
}

