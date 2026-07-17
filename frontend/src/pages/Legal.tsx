import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Moon, ArrowLeft } from 'lucide-react'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../lib/support'

function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <nav className="border-b border-navy-800 bg-navy-950/90">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={13} className="text-white" />
            </div>
            <span className="font-bold tracking-widest text-sm">ASTER</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Retour
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-xs text-slate-500 mb-10">Dernière mise à jour : 17 juillet 2026</p>
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {children}
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function CGU() {
  return (
    <LegalShell title="Conditions Générales d'Utilisation">
      <Section title="1. Objet">
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
          de l'application web ASTER (ci-après « le Service »), accessible via navigateur.
          En créant un compte ou en utilisant ASTER, tu acceptes ces CGU.
        </p>
      </Section>

      <Section title="2. Description du Service">
        <p>
          ASTER est un outil de bien-être émotionnel proposant notamment : check-in émotionnel,
          protocoles de régulation guidés, journal et analyses assistées par IA.
        </p>
        <p>
          <strong className="text-white">ASTER n'est pas un dispositif médical et ne constitue pas une thérapie.</strong>{' '}
          Il ne remplace pas l'avis, le diagnostic ou le suivi d'un professionnel de santé mentale.
          En cas de détresse, contacte un professionnel ou les services d'urgence adaptés.
        </p>
      </Section>

      <Section title="3. Inscription et compte">
        <p>
          L'accès au Service nécessite la création d'un compte (via Clerk). Tu t'engages à fournir
          des informations exactes et à préserver la confidentialité de tes identifiants.
          Tu es responsable de l'activité réalisée depuis ton compte.
        </p>
      </Section>

      <Section title="4. Essai gratuit et abonnements">
        <p>
          ASTER propose un essai gratuit limité dans le temps, puis des formules Premium (mensuelle
          ou annuelle) payantes via Stripe. Les prix affichés sur le site font foi.
          Les abonnements sont résiliables à tout moment depuis ton profil (portail Stripe).
          En cas de résiliation, l'accès Premium reste actif jusqu'à la fin de la période déjà payée,
          sauf indication contraire au moment de l'achat.
        </p>
      </Section>

      <Section title="5. Utilisation acceptable">
        <p>Tu t'engages à ne pas :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>utiliser le Service de manière frauduleuse ou illégale ;</li>
          <li>perturber le fonctionnement technique du Service ;</li>
          <li>publier des contenus injurieux, illicites ou portant atteinte aux droits de tiers
            (notamment via les avis) ;</li>
          <li>tenter d'accéder aux données d'autres utilisateurs.</li>
        </ul>
      </Section>

      <Section title="6. Propriété intellectuelle">
        <p>
          Les contenus, marques, protocoles, textes et éléments graphiques d'ASTER sont protégés.
          Toute reproduction non autorisée est interdite. Tes contenus personnels (journal, check-ins,
          avis) restent les tiens ; tu nous accordes une licence limitée pour les héberger et
          les traiter afin de fournir le Service.
        </p>
      </Section>

      <Section title="7. Disponibilité et limitation de responsabilité">
        <p>
          Nous nous efforçons d'assurer la disponibilité du Service, sans garantie d'un accès
          ininterrompu. Dans les limites autorisées par la loi, ASTER ne saurait être tenu responsable
          des dommages indirects, pertes de données ou décisions prises sur la seule base du Service.
        </p>
      </Section>

      <Section title="8. Résiliation">
        <p>
          Tu peux supprimer ton compte ou cesser d'utiliser le Service à tout moment.
          Nous pouvons suspendre ou résilier l'accès en cas de violation des présentes CGU.
        </p>
      </Section>

      <Section title="9. Modifications">
        <p>
          Nous pouvons mettre à jour ces CGU. La date de mise à jour figure en tête de page.
          L'utilisation continue du Service après modification vaut acceptation des nouvelles conditions,
          dans la mesure permise par la loi.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Pour toute question relative aux CGU :{' '}
          <a href={SUPPORT_MAILTO} className="text-periwinkle-400 hover:text-periwinkle-300">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </Section>
    </LegalShell>
  )
}

export function Confidentialite() {
  return (
    <LegalShell title="Politique de confidentialité">
      <Section title="1. Responsable du traitement">
        <p>
          Les données collectées via ASTER sont traitées dans le cadre de la fourniture du Service.
          Pour toute demande relative à tes données :{' '}
          <a href={SUPPORT_MAILTO} className="text-periwinkle-400 hover:text-periwinkle-300">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </Section>

      <Section title="2. Données collectées">
        <p>Selon ton utilisation, nous pouvons traiter :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className="text-white">Compte</strong> : identifiant, e-mail, prénom/nom (via Clerk) ;</li>
          <li><strong className="text-white">Usage</strong> : check-ins, entrées de journal, préférences de notification ;</li>
          <li><strong className="text-white">Paiement</strong> : données de facturation gérées par Stripe (nous ne stockons pas tes numéros de carte) ;</li>
          <li><strong className="text-white">Avis</strong> : prénom, note et commentaire si tu en publies ;</li>
          <li><strong className="text-white">Technique / analytics</strong> : données d'usage via des outils comme PostHog, Google Analytics ou Microsoft Clarity (pages vues, interactions), afin d'améliorer le Service.</li>
        </ul>
      </Section>

      <Section title="3. Finalités">
        <p>Tes données sont utilisées pour :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>fournir et personnaliser le Service (check-in, protocoles, journal, insights) ;</li>
          <li>gérer l'essai, l'abonnement et le support ;</li>
          <li>envoyer les e-mails que tu as activés (ex. rappels) ;</li>
          <li>améliorer l'expérience produit et la sécurité ;</li>
          <li>afficher les avis que tu choisis de publier.</li>
        </ul>
      </Section>

      <Section title="4. Bases légales">
        <p>
          Selon les cas : exécution du contrat (fourniture du Service), consentement (ex. certains
          cookies / analytics ou notifications), intérêt légitime (sécurité, amélioration du produit),
          ou obligations légales (comptabilité / facturation).
        </p>
      </Section>

      <Section title="5. Destinataires et sous-traitants">
        <p>
          Tes données peuvent être traitées par des prestataires nécessaires au Service, notamment :
          Clerk (authentification), Stripe (paiements), hébergeurs (ex. Vercel, Railway),
          Resend (e-mails), et outils d'analytics. Ces prestataires agissent selon leurs propres
          politiques et nos instructions contractuelles lorsque applicable.
        </p>
      </Section>

      <Section title="6. Durée de conservation">
        <p>
          Les données de compte et d'usage sont conservées tant que ton compte est actif, puis
          supprimées ou anonymisées dans un délai raisonnable après suppression du compte,
          sauf obligation légale de conservation plus longue (ex. facturation).
        </p>
      </Section>

      <Section title="7. Tes droits">
        <p>
          Conformément au RGPD, tu peux demander l'accès, la rectification, l'effacement,
          la limitation, la portabilité, ou t'opposer à certains traitements.
          Pour exercer ces droits :{' '}
          <a href={SUPPORT_MAILTO} className="text-periwinkle-400 hover:text-periwinkle-300">
            {SUPPORT_EMAIL}
          </a>
          . Tu peux également introduire une réclamation auprès de la CNIL (cnil.fr).
        </p>
      </Section>

      <Section title="8. Cookies et traceurs">
        <p>
          ASTER peut utiliser des cookies ou technologies similaires pour le fonctionnement du
          compte, la mesure d'audience et l'amélioration du produit. Tu peux restreindre certains
          traceurs via les paramètres de ton navigateur.
        </p>
      </Section>

      <Section title="9. Sécurité">
        <p>
          Nous mettons en œuvre des mesures raisonnables pour protéger tes données.
          Aucun système n'étant infaillible, nous t'invitons à utiliser un mot de passe robuste
          et à nous signaler tout incident suspect.
        </p>
      </Section>

      <Section title="10. Modifications">
        <p>
          Cette politique peut évoluer. La date de mise à jour figure en tête de page.
        </p>
      </Section>
    </LegalShell>
  )
}
