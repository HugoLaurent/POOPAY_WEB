import { Link } from "react-router-dom";
import { BackButton, LegalLinks, SEO } from "@/components";

const sections = [
  {
    title: "1. Éditeur du site",
    content: (
      <>
        <p>
          Le site Poopay (ci-après « le Site ») est édité par Hugo Laurent en
          tant qu’entrepreneur individuel (auto-entrepreneur). Les coordonnées
          personnelles complètes sont disponibles sur demande, conformément à la
          réglementation française.
        </p>
        <p>
          Email :{" "}
          <a href="mailto:privacy@poopay.app" className="underline">
            privacy@poopay.app
          </a>
        </p>
        <p>Directeur de la publication : Hugo Laurent</p>
      </>
    ),
  },
  {
    title: "2. Hébergement",
    content: (
      <>
        <p>
          Le Site est hébergé sur une infrastructure personnelle opérée par Hugo
          Laurent (serveur auto-hébergé situé en France).
        </p>
        <p>
          Pour des raisons de sécurité, les informations techniques détaillées
          sont fournies sur demande écrite et peuvent nécessiter une
          identification préalable du demandeur.
        </p>
      </>
    ),
  },
  {
    title: "3. Objet du site",
    content: (
      <>
        <p>
          Poopay est une application web permettant de suivre de manière ludique
          et humoristique le temps passé aux toilettes au travail et d’en
          estimer la « rémunération » associée, grâce à des statistiques,
          groupes et classements.
        </p>
        <p>
          Poopay n’est ni un outil de paie officiel, ni un outil de gestion du
          temps de travail certifié, ni un dispositif de contrôle des salariés.
        </p>
      </>
    ),
  },
  {
    title: "4. Propriété intellectuelle",
    content: (
      <p>
        L’ensemble des éléments du Site (textes, graphiques, logos, marques,
        design, code source, etc.) sont la propriété exclusive de Hugo Laurent,
        sauf mentions contraires. Toute reproduction, représentation,
        modification, adaptation, diffusion ou exploitation, totale ou
        partielle, du Site ou de l’un quelconque de ses éléments, par quelque
        procédé que ce soit, sans autorisation écrite préalable, est strictement
        interdite et pourra faire l’objet de poursuites.
      </p>
    ),
  },
  {
    title: "5. Données personnelles",
    content: (
      <>
        <p>
          Dans le cadre de l’utilisation du Site, des données personnelles
          peuvent être collectées et traitées (création de compte, statistiques
          d’utilisation, gestion des abonnements, etc.).
        </p>
        <p>Le responsable de traitement est : Hugo Laurent.</p>
        <p>
          Pour plus d’informations sur les traitements, les droits des
          utilisateurs et leur exercice, consultez la{" "}
          <Link
            to="/politique-de-confidentialite"
            className="underline"
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    title: "6. Cookies et traceurs",
    content: (
      <>
        <p>Le Site utilise des cookies et technologies similaires afin de :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>assurer le fonctionnement technique du Site ;</li>
          <li>mémoriser les préférences de l’utilisateur ;</li>
          <li>mesurer l’audience de manière anonyme ou pseudonymisée ;</li>
          <li>gérer le consentement via un bandeau dédié si nécessaire.</li>
        </ul>
        <p>
          L’utilisateur peut paramétrer ses préférences via le panneau de gestion
          des cookies et depuis son navigateur.
        </p>
        <p>
          Pour plus de détails, se référer à la Politique de confidentialité
          et/ou à la Politique de cookies.
        </p>
      </>
    ),
  },
  {
    title: "7. Responsabilité",
    content: (
      <>
        <p>
          L’éditeur s’efforce de fournir des informations exactes et à jour sur
          le Site mais ne peut garantir l’absence totale d’erreurs ou
          d’omissions. Le Site est fourni « en l’état », sans garantie de
          disponibilité permanente ni d’absence d’interruptions, de bugs ou
          d’erreurs.
        </p>
        <p>L’Utilisateur utilise le Site sous sa propre responsabilité.</p>
        <p>L’éditeur ne pourra être tenu responsable :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>des dommages résultant d’une indisponibilité du Site ;</li>
          <li>de toute perte de données ou dommage indirect ;</li>
          <li>
            d’une utilisation du Site non conforme aux présentes, aux CGV ou à
            la réglementation.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "8. Disclaimer Santé",
    content: (
      <>
        <p>
          Poopay repose sur un concept humoristique lié au temps passé assis aux
          toilettes. Cependant :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            rester assis de manière prolongée peut avoir des conséquences sur la
            santé ;
          </li>
          <li>
            Poopay ne fournit aucun conseil médical et n’est pas un dispositif
            médical ;
          </li>
          <li>
            en cas de gêne ou de trouble de santé, consultez un professionnel de
            santé qualifié.
          </li>
        </ul>
        <p>
          L’éditeur décline toute responsabilité quant aux choix de posture, de
          fréquence ou de durée des pauses toilettes des utilisateurs.
        </p>
      </>
    ),
  },
  {
    title: "9. Disclaimer Usage au travail",
    content: (
      <>
        <p>L’utilisation de Poopay au travail relève de la seule responsabilité de l’utilisateur.</p>
        <p>
          Il appartient à chaque utilisateur de vérifier la compatibilité avec
          les règles internes de son employeur.
        </p>
        <p>
          Poopay n’est pas un outil officiel de suivi du temps de travail ni un
          justificatif opposable à l’employeur. Les calculs de « salaire »
          estimé sont purement indicatifs et ludiques.
        </p>
        <p>
          L’éditeur ne pourra être tenu responsable de conséquences
          professionnelles liées à l’usage du Site.
        </p>
      </>
    ),
  },
  {
    title: "10. Droit applicable",
    content: (
      <p>
        Les présentes mentions légales sont soumises au droit français. En cas
        de litige, et à défaut de résolution amiable, les juridictions françaises
        seront seules compétentes.
      </p>
    ),
  },
];

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-poopay-bg text-poopay-text">
      <SEO
        title="Mentions légales – Poopay"
        description="Mentions légales du site Poopay : éditeur, hébergeur, responsabilité et informations réglementaires."
        url="https://poopay.hugolaurent.fr/mentions-legales"
      />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <BackButton className="mb-6" fallback="/" />
        <header className="space-y-4 text-center md:text-left">
          <p className="text-sm uppercase tracking-widest text-poopay-mute">
            Page /mentions-legales
          </p>
          <h1 className="text-3xl font-extrabold text-poopay-text">
            Mentions légales – Poopay
          </h1>
          <p className="text-poopay-mute">
            Informations réglementaires concernant l’éditeur, l’hébergeur et les
            responsabilités liées à l’utilisation du service Poopay.
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
      </div>
      <LegalLinks className="px-4 pb-12" />
    </div>
  );
}
