import { SimpleModal } from "@/components";

const SUPPORT_EMAIL = "support@poopay.app";

export default function ConfidentialitePermissions({ isOpen, onClose }) {
  const handleContact = () => {
    const mailtoLink = `mailto:${SUPPORT_EMAIL}`;
    if (typeof window !== "undefined") {
      window.location.href = mailtoLink;
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-t-3xl"
      closeOnBackdrop
    >
      <div className="p-6 space-y-6 text-sm text-poopay-text/90">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-poopay-text">
              Confidentialité & permissions
            </h2>
            <p className="text-xs text-poopay-mute mt-1">
              Ce rappel reprend nos engagements, vos droits et les bonnes
              pratiques à suivre pour utiliser Poopay sereinement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-poopay-mute hover:text-poopay-text transition"
          >
            Fermer
          </button>
        </header>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-poopay-text">
            Règles d'utilisation
          </h3>
          <ul className="space-y-2">
            <li className="rounded-2xl bg-poopay-card/80 px-4 py-3">
              Utilise l'application de manière responsable : pas de partage de
              contenus offensants ou discriminatoires, ni de tentative
              d'accès non autorisé.
            </li>
            <li className="rounded-2xl bg-poopay-card/80 px-4 py-3">
              Respecte la confidentialité des autres utilisateurs. Les
              informations affichées sont destinées à la communauté Poopay et ne
              doivent pas être diffusées publiquement sans accord.
            </li>
            <li className="rounded-2xl bg-poopay-card/80 px-4 py-3">
              Signale rapidement tout comportement inapproprié ou toute faille
              potentielle afin que nous puissions agir.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-poopay-text">
            Protection des données
          </h3>
          <div className="space-y-2 leading-relaxed">
            <p>
              Les données recueillies servent uniquement à fournir les services
              de Poopay (classements, suivi des défis, statistiques). Elles sont
              stockées dans des environnements sécurisés, accessibles aux seules
              équipes habilitées.
            </p>
            <p>
              Tu conserves le contrôle sur tes informations : accède, exporte ou
              supprime tes données à tout moment depuis les réglages ou en
              contactant notre support. Nous respectons la réglementation
              européenne en matière de protection des données (RGPD).
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-poopay-text">
            Utilisation sur ton lieu de travail
          </h3>
          <div className="space-y-2 leading-relaxed">
            <p>
              Avant d'utiliser Poopay pendant tes heures de travail, vérifie les
              politiques internes de ton entreprise. Certaines organisations
              considèrent l'utilisation d'applications non professionnelles
              comme une infraction disciplinaire.
            </p>
            <p>
              L'application ne saurait être tenue responsable des sanctions
              éventuelles liées à une utilisation en dehors du cadre autorisé
              par ton employeur. Utilise-la idéalement pendant tes pauses ou en
              dehors du temps de travail contractuel.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-poopay-text">
            Santé, posture et pauses
          </h3>
          <div className="space-y-2 leading-relaxed">
            <p>
              Poopay n'est pas un dispositif médical. Écoute ton corps, fais des
              pauses régulières et consulte un professionnel de santé en cas de
              douleurs persistantes.
            </p>
            <p>
              Adopte une posture adaptée : dos droit, épaules relâchées,
              mouvements doux. Évite de rester assis trop longtemps sans te
              lever ou t'étirer.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-poopay-text">
            Besoin d'aide ?
          </h3>
          <div className="space-y-2 leading-relaxed">
            <p>
              Pour toute question juridique ou RH, rapproche-toi de ton service
              interne. Pour toute demande liée à Poopay, utilise le canal de
              support mis à ta disposition dans l'application.
            </p>
            <p className="text-xs text-poopay-mute">
              En continuant à utiliser Poopay, tu confirmes avoir pris
              connaissance de ces informations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleContact}
              className="rounded-xl border border-[#8B4513] bg-[#8B4513] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#72380f]"
            >
              Nous contacter
            </button>
            <span className="text-xs text-poopay-mute">{SUPPORT_EMAIL}</span>
          </div>
        </section>
      </div>
    </SimpleModal>
  );
}
