import { Link } from "react-router-dom";
import { BackButton, LegalLinks, SEO } from "@/components";

const sections = [
  {
    title: "1. Objet",
    content: (
      <p>
        Les présentes Conditions Générales de Vente (CGV) définissent les
        modalités et conditions de vente des services payants proposés par
        Poopay, ainsi que les droits et obligations des parties. Elles
        complètent la Politique de confidentialité.
      </p>
    ),
  },
  {
    title: "2. Identification du vendeur",
    content: (
      <>
        <p>Nom : Hugo Laurent</p>
        <p>Statut : Entrepreneur individuel (auto-entrepreneur)</p>
        <p>Adresse : disponible sur demande conformément à la réglementation</p>
        <p>
          Email :{" "}
          <a href="mailto:privacy@poopay.app" className="underline">
            privacy@poopay.app
          </a>
        </p>
      </>
    ),
  },
  {
    title: "3. Description des services",
    content: (
      <>
        <p>Poopay propose :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Offre gratuite :</strong> accès à l’application avec
            certaines fonctionnalités limitées, notamment un nombre maximum de
            membres par groupe.
          </li>
          <li>
            <strong>Offre payante « Poopay Premium » :</strong> suppression ou
            extension des limites de groupes, fonctionnalités avancées
            (statistiques étendues, exports, options supplémentaires de gestion,
            etc.).
          </li>
        </ul>
        <p>
          Les caractéristiques exactes des services sont présentées sur le Site
          et peuvent évoluer.
        </p>
      </>
    ),
  },
  {
    title: "4. Prix",
    content: (
      <>
        <p>
          Les prix des abonnements sont indiqués sur le Site en euros (€),
          toutes taxes comprises ou, le cas échéant, avec la mention « TVA non
          applicable, article 293 B du CGI ».
        </p>
        <p>
          Poopay peut modifier les prix pour l’avenir. Les abonnements en cours
          restent au prix en vigueur lors de la souscription, sauf accord
          contraire explicite.
        </p>
      </>
    ),
  },
  {
    title: "5. Modalités de paiement",
    content: (
      <>
        <p>
          Le paiement s’effectue en ligne via Stripe. L’utilisateur fournit ses
          informations de paiement directement à Stripe.
        </p>
        <p>Poopay ne stocke aucune donnée complète de carte bancaire.</p>
        <p>
          En cas de refus ou rejet du paiement, l’accès aux fonctionnalités
          Premium peut être suspendu ou résilié.
        </p>
      </>
    ),
  },
  {
    title: "6. Entrée en vigueur de l’abonnement",
    content: (
      <p>
        L’accès aux fonctionnalités Premium est accordé immédiatement après la
        confirmation du paiement par Stripe. L’exécution du service numérique
        commence dès la validation du paiement.
      </p>
    ),
  },
  {
    title: "7. Durée et résiliation",
    content: (
      <>
        <p>Selon l’offre choisie, l’abonnement :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>est mensuel ou annuel, renouvelé par tacite reconduction ; ou</li>
          <li>accorde un accès Premium pour une durée déterminée.</li>
        </ul>
        <p>
          L’utilisateur peut résilier à tout moment depuis Poopay ou via les
          modalités indiquées sur le Site. La résiliation prend effet à la fin
          de la période en cours, sauf mention contraire. Aucun remboursement
          prorata temporis n’est dû, sauf disposition légale impérative ou
          engagement contraire.
        </p>
        <p>
          L’éditeur peut suspendre ou résilier l’abonnement en cas de
          non-paiement, fraude ou non-respect des présentes CGV.
        </p>
      </>
    ),
  },
  {
    title: "8. Droit de rétractation",
    content: (
      <>
        <p>
          Conformément à l’article L221-28 du Code de la consommation, le droit
          de rétractation ne s’applique pas lorsque l’exécution du service
          numérique commence avant la fin du délai légal avec l’accord préalable
          du consommateur et renoncement exprès.
        </p>
        <p>
          En souscrivant à Poopay Premium et en accédant immédiatement aux
          services, l’utilisateur renonce expressément à son droit de
          rétractation.
        </p>
      </>
    ),
  },
  {
    title: "9. Obligations de l’utilisateur",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          fournir des informations exactes lors de la création du compte ;
        </li>
        <li>
          utiliser Poopay dans le respect des lois et règlements en vigueur ;
        </li>
        <li>
          ne pas détourner Poopay de son objet ludique pour surveiller ou
          contrôler abusivement autrui ;
        </li>
        <li>
          garder ses identifiants confidentiels et assumer les activités
          effectuées depuis son compte.
        </li>
      </ul>
    ),
  },
  {
    title: "10. Responsabilité – Santé & usage au travail",
    content: (
      <>
        <p>
          Poopay est un service ludique et informel, sans valeur médicale ni
          légale :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Poopay n’est pas un dispositif médical ni un outil officiel de suivi
            du temps de travail ;
          </li>
          <li>
            les statistiques et estimations de « salaire » sont purement
            indicatives ;
          </li>
          <li>
            rester assis longtemps peut présenter des risques de santé ; en cas
            de doute, consultez un professionnel ;
          </li>
          <li>
            l’utilisation au travail doit respecter les règles internes et la
            législation applicable.
          </li>
        </ul>
        <p>
          La responsabilité de l’éditeur ne peut être engagée qu’en cas de faute
          prouvée et pour des dommages directs. Elle est limitée au montant payé
          par l’utilisateur au cours des 12 derniers mois précédant le fait
          générateur du dommage.
        </p>
      </>
    ),
  },
  {
    title: "11. Propriété intellectuelle",
    content: (
      <p>
        Les contenus, marques, logos, visuels, textes, interface et
        fonctionnalités de Poopay sont protégés par le droit de la propriété
        intellectuelle. Toute utilisation non autorisée est interdite.
      </p>
    ),
  },
  {
    title: "12. Données personnelles",
    content: (
      <>
        <p>
          Les traitements de données personnelles liés aux services payants sont
          décrits dans la{" "}
          <Link to="/politique-de-confidentialite" className="underline">
            Politique de confidentialité
          </Link>
          .
        </p>
        <p>
          L’utilisateur est invité à la consulter pour connaître ses droits et
          modalités d’exercice.
        </p>
      </>
    ),
  },
  {
    title: "13. Droit applicable – Litiges",
    content: (
      <>
        <p>Les présentes CGV sont soumises au droit français.</p>
        <p>
          En cas de litige, l’utilisateur est invité à contacter l’éditeur pour
          rechercher une solution amiable. À défaut, les tribunaux français
          compétents pourront être saisis, sous réserve des règles impératives
          applicables.
        </p>
      </>
    ),
  },
];

export default function ConditionsGeneralesVente() {
  return (
    <div className="min-h-screen bg-poopay-bg text-poopay-text">
      <SEO
        title="Conditions Générales de Vente – Poopay"
        description="CGV Poopay : offres, prix, paiements, droit de rétractation et responsabilités."
        url="https://poopay.hugolaurent.fr/cgv"
      />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <BackButton className="mb-6" fallback="/" />
        <header className="space-y-4 text-center md:text-left">
          <p className="text-sm uppercase tracking-widest text-poopay-mute">
            Page /cgv
          </p>
          <h1 className="text-3xl font-extrabold text-poopay-text">
            Conditions Générales de Vente – Poopay
          </h1>
          <p className="text-poopay-mute">
            Référentiel contractuel des offres payantes Poopay Premium.
          </p>
        </header>
        <div className="space-y-6 bg-poopay-card rounded-3xl shadow-soft p-6 md:p-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold text-poopay-text">
                {section.title}
              </h2>
              <div className="prose prose-neutral max-w-none text-poopay-text/90">
                {section.content}
              </div>
            </section>
          ))}
        </div>
        <div className="text-sm text-poopay-mute text-center">
          Consultez également les{" "}
          <Link to="/mentions-legales" className="underline">
            Mentions légales
          </Link>{" "}
          et la{" "}
          <Link to="/politique-de-confidentialite" className="underline">
            Politique de confidentialité
          </Link>
          .
        </div>
      </div>
      <LegalLinks className="px-4 pb-12" />
    </div>
  );
}
