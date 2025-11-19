import { Link } from "react-router-dom";
import { BackButton, LegalLinks, SEO } from "@/components";

const sections = [
  {
    title: "1. Préambule",
    content: (
      <>
        <p>
          La présente Politique de confidentialité décrit la manière dont
          Poopay, édité par Hugo Laurent, collecte, utilise, conserve et protège
          les données personnelles des utilisateurs conformément au RGPD et à la
          loi Informatique et Libertés.
        </p>
        <p>
          En utilisant le Site, l’utilisateur reconnaît avoir pris connaissance
          de la présente Politique et l’accepter.
        </p>
      </>
    ),
  },
  {
    title: "2. Responsable de traitement",
    content: (
      <>
        <p>Responsable : Hugo Laurent</p>
        <p>Statut : Entrepreneur individuel (auto-entrepreneur)</p>
        <p>Adresse : disponible sur demande conformément à la loi</p>
        <p>
          Email de contact (données personnelles) :{" "}
          <a href="mailto:privacy@poopay.app" className="underline">
            privacy@poopay.app
          </a>
        </p>
      </>
    ),
  },
  {
    title: "3. Données collectées",
    content: (
      <>
        <p>
          Poopay collecte uniquement les données strictement nécessaires au
          fonctionnement du service et à l’amélioration de l’expérience
          utilisateur :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Données de compte :</strong> email, pseudonyme, mot de passe
            hashé.
          </li>
          <li>
            <strong>Données de profil et d’usage :</strong> salaire mensuel
            estimé, heures de travail, informations liées aux groupes,
            statistiques d’utilisation, préférences.
          </li>
          <li>
            <strong>Données de paiement :</strong> identifiant client Stripe,
            informations d’abonnement, références pseudonymisées. Les données
            complètes de carte bancaire ne sont jamais stockées par Poopay.
          </li>
          <li>
            <strong>Données techniques :</strong> adresse IP anonymisée si
            nécessaire, logs, informations navigateur/appareil, cookies ou
            traceurs nécessaires au service ou à la mesure d’audience
            anonymisée.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Finalités et bases légales",
    content: (
      <>
        <p>Les traitements poursuivent les finalités suivantes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Fourniture du service Poopay : gestion de compte, groupes,
            statistiques, abonnements Premium (base légale : exécution du
            contrat, art. 6.1.b RGPD).
          </li>
          <li>
            Traitement des paiements via Stripe : gestion des paiements,
            prévention de la fraude, obligations légales (bases légales :
            exécution du contrat, intérêt légitime sécurité, obligation légale).
          </li>
          <li>
            Sécurité du Site : logs techniques, détection d’usages anormaux
            (base légale : intérêt légitime).
          </li>
          <li>
            Amélioration du service et statistiques agrégées (base légale :
            intérêt légitime).
          </li>
          <li>
            Gestion des demandes des utilisateurs et exercice des droits (bases
            légales : obligation légale et/ou exécution du contrat).
          </li>
        </ul>
        <p>
          Lorsque certains traitements reposent sur le consentement (cookies non
          essentiels), celui-ci peut être retiré à tout moment via le panneau de
          gestion des cookies ou le navigateur.
        </p>
      </>
    ),
  },
  {
    title: "5. Destinataires des données",
    content: (
      <>
        <p>Les données personnelles sont accessibles uniquement :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>à l’éditeur et à ses prestataires habilités ;</li>
          <li>aux services de paiement (Stripe) ;</li>
          <li>aux prestataires d’hébergement et de maintenance ;</li>
          <li>aux prestataires d’envoi d’emails transactionnels ;</li>
          <li>aux autorités compétentes en cas d’obligation légale.</li>
        </ul>
        <p>
          Poopay ne revend pas les données personnelles et ne les utilise pas
          pour du ciblage publicitaire.
        </p>
      </>
    ),
  },
  {
    title: "6. Transfert hors Union européenne",
    content: (
      <>
        <p>
          Certains prestataires (Stripe, emailing, etc.) peuvent être situés en
          dehors de l’Union européenne.
        </p>
        <p>
          Dans ce cas, Poopay met en place des garanties adaptées : clauses
          contractuelles types, mesures techniques et organisationnelles
          renforcées, minimisation et pseudonymisation des données transférées.
        </p>
      </>
    ),
  },
  {
    title: "7. Durées de conservation",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Compte utilisateur : durée d’utilisation du service puis jusqu’à 3 ans
          après la dernière activité ou demande de suppression, sauf obligation
          légale contraire.
        </li>
        <li>Données de paiement/facturation : conservation légale (10 ans).</li>
        <li>Logs techniques et de sécurité : jusqu’à 12 mois.</li>
        <li>
          Statistiques agrégées anonymisées : conservation plus longue possible.
        </li>
        <li>Cookies : durée entre la session et 13 mois selon leur nature.</li>
      </ul>
    ),
  },
  {
    title: "8. Droits des utilisateurs",
    content: (
      <>
        <p>
          Conformément au RGPD, l’utilisateur dispose des droits d’accès,
          rectification, effacement, limitation, opposition, portabilité et de
          définition de directives post-mortem.
        </p>
        <p>
          Les droits peuvent être exercés depuis l’interface Poopay (export,
          suppression, etc.) ou en écrivant à{" "}
          <a href="mailto:privacy@poopay.app" className="underline">
            privacy@poopay.app
          </a>
          . Une pièce d’identité peut être demandée.
        </p>
        <p>
          L’utilisateur peut également introduire une réclamation auprès de la{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            CNIL
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "9. Sécurité des données",
    content: (
      <>
        <p>Poopay met en œuvre :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>chiffrement des communications (HTTPS) ;</li>
          <li>mots de passe stockés sous forme hashée ;</li>
          <li>contrôle d’accès aux serveurs et bases ;</li>
          <li>journalisation des opérations sensibles ;</li>
          <li>mises à jour régulières des composants.</li>
        </ul>
        <p>
          Aucun système n’étant infaillible, l’utilisateur est invité à utiliser
          un mot de passe robuste et unique.
        </p>
      </>
    ),
  },
  {
    title: "10. Disclaimer Santé & usage au travail",
    content: (
      <>
        <p>
          Les données collectées relatives au temps passé aux toilettes et aux
          estimations de « salaire » associées :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            ont une finalité ludique et d’auto-suivi informel, non médicale ;
          </li>
          <li>
            ne doivent pas servir à poser un diagnostic ou orienter un
            traitement ;
          </li>
          <li>
            n’ont pas vocation à justifier un comportement vis-à-vis de
            l’employeur.
          </li>
        </ul>
        <p>
          En cas de questions de santé, consultez un professionnel. L’utilisation
          au travail doit respecter les règles internes et la législation
          applicable.
        </p>
      </>
    ),
  },
  {
    title: "11. Modifications",
    content: (
      <>
        <p>
          La présente Politique peut être mise à jour à tout moment. En cas de
          modification substantielle, l’utilisateur pourra être informé via le
          Site.
        </p>
        <p>Dernière mise à jour : 18 novembre 2025.</p>
      </>
    ),
  },
];

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-poopay-bg text-poopay-text">
      <SEO
        title="Politique de confidentialité – Poopay"
        description="Tout savoir sur la collecte, le traitement et la protection des données personnelles sur Poopay."
        url="https://poopay.hugolaurent.fr/politique-de-confidentialite"
      />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <BackButton className="mb-6" fallback="/" />
        <header className="space-y-4 text-center md:text-left">
          <p className="text-sm uppercase tracking-widest text-poopay-mute">
            Page /politique-de-confidentialite
          </p>
          <h1 className="text-3xl font-extrabold text-poopay-text">
            Politique de confidentialité – Poopay
          </h1>
          <p className="text-poopay-mute">
            Informations complètes sur la gestion des données personnelles,
            l’usage des cookies et les droits des utilisateurs.
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
          Besoin d’en savoir plus ? Consultez aussi les{" "}
          <Link to="/mentions-legales" className="underline">
            Mentions légales
          </Link>{" "}
          et les{" "}
          <Link to="/cgv" className="underline">
            Conditions générales de vente
          </Link>
          .
        </div>
      </div>
      <LegalLinks className="px-4 pb-12" />
    </div>
  );
}
