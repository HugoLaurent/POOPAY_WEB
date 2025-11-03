import { SimpleModal } from "@/components";
import { Globe, Save, ShieldCheck, Lock } from "lucide-react";

const SUPPORT_EMAIL = "privacy@poopay.app";

const DATA_POINTS = [
  "Identifiants de compte (email, nom d'utilisateur)",
  "Statistiques d'utilisation (sessions, durées, classements)",
  "Préférences enregistrées dans l'application",
  "Données de groupes et invitations",
];

const DATA_USAGE = [
  "Fournir les fonctionnalités Poopay (groupes, classements, sessions)",
  "Assurer la sécurité, la modération et la lutte contre la fraude",
  "Améliorer l'expérience utilisateur à partir de statistiques agrégées",
  "Analyser le trafic du site (mesure d’audience anonyme)",
];

const RIGHTS_LIST = [
  "Droit d'accès et de rectification",
  "Droit à l'effacement (droit à l'oubli)",
  "Droit à la portabilité",
  "Droit d'opposition à certains traitements",
];

function openContact() {
  if (typeof window === "undefined") return;
  window.location.href = `mailto:${SUPPORT_EMAIL}`;
}

export default function ConfidentialitePermissions({ isOpen, onClose }) {
  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop
      className="rounded-t-3xl"
    >
      <div className="max-h-[85vh] overflow-y-auto px-6 py-7 text-sm text-poopay-text/90 space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-poopay-active">
              <Lock size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                Sécurité
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-poopay-text">
              Confidentialité & permissions
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-poopay-mute">
              Voici comment Poopay protège tes données sur le Web, quelles
              autorisations sont sollicitées et comment les contrôler depuis ton
              navigateur.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-poopay-mute transition hover:text-poopay-text"
          >
            Fermer
          </button>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-poopay-text">
            🔒 Politique de confidentialité
          </h3>
          <p className="leading-relaxed">
            Poopay respecte ta vie privée et collecte uniquement les
            informations indispensables à l’usage du site. Les données sont
            hébergées en Europe, chiffrées en transit et jamais revendues ou
            utilisées pour du ciblage publicitaire.
          </p>
          <div className="rounded-3xl border border-poopay-card/70 bg-poopay-card/70 p-4 shadow-soft">
            <h4 className="text-sm font-semibold text-poopay-text">
              Données collectées
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-poopay-text/80">
              {DATA_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-poopay-active">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-poopay-card/70 bg-poopay-card/70 p-4 shadow-soft">
            <h4 className="text-sm font-semibold text-poopay-text">
              Utilisation des données
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-poopay-text/80">
              {DATA_USAGE.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-poopay-active">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-poopay-text">
            Partage des données
          </h3>
          <p className="leading-relaxed text-poopay-text/80">
            Nous ne partageons tes informations personnelles que dans les cas
            suivants :
          </p>
          <ul className="space-y-2 text-sm text-poopay-text/80">
            <li className="rounded-2xl bg-poopay-card/70 px-4 py-3 shadow-soft">
              Avec les membres de tes groupes pour afficher classements et
              statistiques.
            </li>
            <li className="rounded-2xl bg-poopay-card/70 px-4 py-3 shadow-soft">
              Avec les autorités compétentes si la loi nous l'impose.
            </li>
          </ul>
          <p className="text-xs text-poopay-mute">
            Tes informations ne sont jamais revendues ni utilisées pour du
            ciblage publicitaire.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-poopay-text">
            🔐 Permissions requises
          </h3>
          <p className="leading-relaxed text-poopay-text/80">
            Certaines fonctionnalités de Poopay nécessitent des autorisations
            spécifiques. Tu peux les ajuster à tout moment depuis les paramètres
            de ton navigateur.
          </p>
          <div className="space-y-3">
            <PermissionCard
              icon={<Globe size={20} />}
              title="Accès Internet"
              description="Synchronisation des données et actualisation des classements en temps réel via notre API."
              notes={[
                "Indispensable pour le fonctionnement de Poopay",
                "Certaines sections deviennent limitées sans connexion",
              ]}
            />
            <PermissionCard
              icon={<Save size={20} />}
              title="Cookies & stockage local"
              description="Enregistrement de tes préférences (thème, sessions) et mise en cache pour accélérer le chargement."
              notes={[
                "Tu peux vider ou bloquer ces données via les paramètres de confidentialité du navigateur",
              ]}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-poopay-text">
            ⚖️ Tes droits (RGPD)
          </h3>
          <div className="rounded-3xl border border-poopay-card/60 bg-poopay-card/50 p-4 shadow-soft">
            <ul className="space-y-2 text-sm text-poopay-text/80">
              {RIGHTS_LIST.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-poopay-active" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-poopay-mute">
            Tu peux exercer ces droits dans les réglages (“Mes données”) ou en
            nous écrivant via le support.
          </p>
        </section>

        <section className="space-y-3 text-sm text-poopay-text/80">
          <h3 className="text-lg font-semibold text-poopay-text">Contact</h3>
          <p>
            Une question ou un besoin spécifique concernant tes données ?
            Écris-nous, notre équipe te répondra rapidement.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openContact}
              className="rounded-xl border border-poopay-active px-4 py-2 text-sm font-semibold text-poopay-active transition hover:bg-poopay-active hover:text-white"
            >
              Contacter Poopay
            </button>
            <span className="text-xs text-poopay-mute">{SUPPORT_EMAIL}</span>
          </div>
          <p className="text-xs text-poopay-mute">
            Dernière mise à jour : 6 octobre 2025
          </p>
        </section>
      </div>
    </SimpleModal>
  );
}

function PermissionCard({ icon, title, description, notes }) {
  return (
    <div className="rounded-3xl border border-poopay-card/70 bg-poopay-card/60 p-4 shadow-soft">
      <div className="flex items-center gap-3 text-poopay-text">
        <span className="rounded-lg bg-poopay-card/90 p-2 text-poopay-active">
          {icon}
        </span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="mt-3 text-sm text-poopay-text/80">{description}</p>
      <ul className="mt-3 space-y-1 text-xs text-poopay-text/70">
        {notes.map((note) => (
          <li key={note} className="flex gap-2">
            <span className="text-poopay-active">•</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
