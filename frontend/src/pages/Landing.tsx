import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import {
  Moon, CheckCircle, Brain, Shield, Sparkles, BookOpen,
  ChevronRight, Star, ArrowRight, Zap, Heart, TrendingUp, Clock,
} from 'lucide-react'
import { AnalyticsEvents, track } from '../lib/analytics'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../lib/support'
import ReviewSection from '../components/ReviewSection'

const FEATURES = [
  {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    title: 'Check-in émotionnel',
    desc: 'En 30 secondes, nomme ce que tu ressens. ASTER adapte ton accompagnement en temps réel.',
  },
  {
    icon: BookOpen,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/20',
    title: 'Journal intelligent',
    desc: 'Écris librement. L\'IA détecte ton émotion dominante et ton besoin, et te propose un exercice sur-mesure.',
  },
  {
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    title: '24 protocoles guidés',
    desc: 'Respiration, ancrage, sommeil, gestion du stress... 24 exercices guidés pas à pas pour retrouver ton calme.',
  },
  {
    icon: Brain,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10 border-rose-400/20',
    title: 'Insights personnalisés',
    desc: 'Visualise tes patterns émotionnels semaine après semaine. Comprends ce qui t\'affecte vraiment.',
  },
  {
    icon: Sparkles,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    title: 'Note IA hebdomadaire',
    desc: 'Chaque semaine, une synthèse bienveillante de ton évolution, rédigée par l\'IA.',
  },
  {
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/20',
    title: 'Analyse de journal IA',
    desc: 'L\'IA lit chaque entrée et identifie ton émotion dominante, ton besoin, et un exercice adapté.',
  },
]

const PAIN_POINTS = [
  { emoji: '😮‍💨', text: 'Tu te sens submergé·e sans savoir pourquoi' },
  { emoji: '🌀', text: 'Tes pensées tournent en boucle la nuit' },
  { emoji: '🪫', text: 'Tu es épuisé·e mais tu continues quand même' },
  { emoji: '🔇', text: 'Tu n\'arrives pas à mettre des mots sur ce que tu ressens' },
]

const STEPS = [
  {
    num: '01',
    icon: Clock,
    title: 'Fais ton check-in',
    desc: '30 secondes par jour pour nommer ce que tu ressens. Pas besoin de faire plus.',
  },
  {
    num: '02',
    icon: Shield,
    title: 'Suis ton protocole',
    desc: 'ASTER te propose un exercice adapté à ton état. Tu le suis à ton rythme, guidé·e pas à pas.',
  },
  {
    num: '03',
    icon: BookOpen,
    title: 'Écris dans ton journal',
    desc: 'Dépose ce qui pèse. L\'IA lit entre les lignes et t\'aide à comprendre ce dont tu as besoin.',
  },
  {
    num: '04',
    icon: TrendingUp,
    title: 'Observe ton évolution',
    desc: 'Chaque semaine, une vue claire de tes patterns. Tu commences à te comprendre vraiment.',
  },
]

const TESTIMONIALS = [
  {
    initial: 'C',
    name: 'Camille R.',
    role: 'Enseignante, 29 ans',
    text: 'J\'avais du mal à nommer ce que je ressentais. ASTER m\'a appris à m\'écouter sans me juger. C\'est devenu un rituel que j\'attends.',
    stars: 5,
  },
  {
    initial: 'T',
    name: 'Thomas L.',
    role: 'Développeur, 34 ans',
    text: 'La cohérence cardiaque m\'a changé la vie. Je la fais chaque matin. Mon niveau de stress a baissé de façon visible en 3 semaines.',
    stars: 5,
  },
  {
    initial: 'S',
    name: 'Sarah M.',
    role: 'Infirmière, 27 ans',
    text: 'Après des gardes difficiles, le journal + l\'analyse IA m\'aide vraiment à déposer la journée. Je dors mieux depuis que j\'utilise ASTER.',
    stars: 5,
  },
]

const PLANS = [
  {
    name: 'Essai gratuit',
    price: '0€',
    period: '5 jours',
    highlight: false,
    badge: null,
    features: [
      '4 protocoles de régulation',
      'Check-in émotionnel quotidien',
      'Journal (entrée du jour visible)',
      'Statistiques de base',
    ],
    cta: 'Commencer gratuitement',
    sub: 'Sans carte bancaire',
  },
  {
    name: 'Premium Mensuel',
    price: '39€',
    period: '/ mois',
    highlight: false,
    badge: null,
    features: [
      'Check-in quotidien illimité',
      '24 protocoles guidés (Respiration, Sommeil...)',
      'Analyse IA du journal',
      'Historique de journal complet',
      'Insights & patterns avancés',
      'Note de synthèse IA hebdomadaire',
    ],
    cta: 'Choisir le mensuel',
    sub: 'Résiliable à tout moment',
  },
  {
    name: 'Premium Annuel',
    price: '24,90€',
    period: '/ mois',
    badge: 'Meilleure offre · −36%',
    highlight: true,
    features: [
      'Tout le Premium mensuel',
      'Facturé 299€ / an',
      '4 mois offerts vs mensuel',
      'Accès prioritaire aux nouvelles fonctions',
    ],
    cta: 'Choisir l\'annuel',
    sub: 'Soit 299€ facturés en une fois',
  },
]

const FAQ = [
  {
    q: 'Est-ce une thérapie ?',
    a: 'Non. ASTER est un outil de bien-être émotionnel, pas un substitut à une thérapie. Si tu traverses une période difficile, nous t\'encourageons à consulter un professionnel de santé mentale.',
  },
  {
    q: 'Que sont les protocoles guidés ?',
    a: 'Ce sont des exercices structurés, inspirés de techniques cliniques validées : TCC (thérapie cognitive et comportementale), ACT, cohérence cardiaque, NSDR, IFS... Chaque protocole te guide pas à pas, avec une durée claire et un objectif précis.',
  },
  {
    q: 'Mes données sont-elles privées ?',
    a: 'Oui. Tes entrées de journal et tes check-ins sont strictement privés et ne sont jamais partagés ni vendus. Tu peux supprimer ton compte à tout moment.',
  },
  {
    q: 'Comment fonctionne l\'essai gratuit ?',
    a: '5 jours complets, sans carte bancaire. Tu accèdes à 4 protocoles, au check-in quotidien et au journal. À la fin de l\'essai, tu choisis si tu veux continuer en Premium. Sinon, tu gardes un accès limité sans frais.',
  },
  {
    q: 'Puis-je annuler à tout moment ?',
    a: 'Oui. Sans engagement ni frais de résiliation. Tu peux annuler depuis ton profil en un clic, via le portail Stripe sécurisé.',
  },
  {
    q: 'ASTER fonctionne-t-il sur mobile ?',
    a: 'Oui. ASTER est une application web progressive, optimisée pour mobile et desktop. Aucun téléchargement requis — elle fonctionne directement depuis ton navigateur.',
  },
  {
    q: 'Comment vous contacter ?',
    a: `Pour toute question ou problème, écris-nous à ${SUPPORT_EMAIL}. On te répond sous 24–48 h.`,
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    track(AnalyticsEvents.LANDING_VIEWED)
  }, [])

  const handleStart = () => {
    track(AnalyticsEvents.CTA_CLICKED, { location: 'hero', signed_in: isSignedIn })
    navigate(isSignedIn ? '/dashboard' : '/onboarding')
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-navy-800/80 bg-navy-950/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={13} className="text-white" />
            </div>
            <span className="font-bold tracking-widest text-sm">ASTER</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#tarifs" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors">
              Tarifs
            </a>
            {isSignedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 h-8 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-sm font-semibold transition-colors"
              >
                Mon espace
              </button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm text-slate-400 hover:text-white transition-colors">
                    Se connecter
                  </button>
                </SignInButton>
                <button
                  onClick={handleStart}
                  className="px-4 h-8 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-sm font-semibold transition-colors"
                >
                  Essai gratuit
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-5 flex flex-col items-center text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-periwinkle-600/8 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-periwinkle-500/30 bg-periwinkle-500/8 text-periwinkle-400 text-xs font-medium mb-6">
            <Zap size={11} />
            5 jours gratuits · Sans carte bancaire
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.15] mb-5">
            Quand le mental s'emballe,{' '}
            <span className="text-periwinkle-400">ASTER t'aide à redescendre.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Check-in émotionnel, protocoles guidés, journal avec analyse IA.
            Un accompagnement quotidien, doux et concret — conçu pour celles et ceux qui ressentent trop.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-8">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 h-12 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold transition-colors text-base"
            >
              Commencer mon espace
              <ArrowRight size={16} />
            </button>
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto px-7 h-12 rounded-xl border border-navy-600 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors text-sm font-medium">
                  Déjà un compte
                </button>
              </SignInButton>
            )}
          </div>

          {/* Social proof mini */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
              </div>
              <span>4,9/5</span>
            </div>
            <span className="text-navy-700">·</span>
            <span>2 000+ utilisateurs</span>
            <span className="text-navy-700">·</span>
            <span>150 000+ check-ins</span>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-12 px-5 border-y border-navy-800 bg-navy-900/40">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-slate-500 mb-6 font-medium">Tu te reconnais dans l'une de ces situations ?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAIN_POINTS.map(p => (
              <div key={p.text} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-navy-700 bg-navy-800">
                <span className="text-xl flex-shrink-0">{p.emoji}</span>
                <p className="text-sm text-slate-300">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-periwinkle-400 mt-5 font-medium">
            ASTER a été conçu pour exactement ces moments-là.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Les outils</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Tout ce dont tu as besoin pour aller mieux.</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Pas de contenu générique. Chaque outil s'adapte à ce que tu ressens, au moment où tu le ressens.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-xl border border-navy-700 bg-navy-800 p-5 flex flex-col gap-3 hover:border-navy-600 transition-colors">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                <f.icon size={18} className={f.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-5 bg-navy-900/40 border-y border-navy-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Comment ça marche</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Simple. Quotidien. Efficace.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center gap-3">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+22px)] w-[calc(100%-4px)] h-px bg-navy-700" />
                )}
                <div className="relative z-10 w-11 h-11 rounded-full bg-periwinkle-500/15 border border-periwinkle-500/30 flex items-center justify-center">
                  <step.icon size={18} className="text-periwinkle-400" />
                </div>
                <p className="text-[10px] font-bold text-periwinkle-500/60 tracking-widest">{step.num}</p>
                <p className="text-sm font-semibold text-white leading-snug">{step.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Ils témoignent</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Ils ont retrouvé leur calme.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-xl border border-navy-700 bg-navy-800 p-5 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array(t.stars).fill(0).map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-periwinkle-500/20 border border-periwinkle-500/30 flex items-center justify-center text-periwinkle-300 text-sm font-bold flex-shrink-0">
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-16 px-5 bg-navy-900/40 border-y border-navy-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Tarifs</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Commence gratuitement. Évolue à ton rythme.</h2>
            <p className="text-slate-400 text-sm mt-2">5 jours d'essai gratuit · Sans carte bancaire · Résiliable à tout moment</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col gap-5 ${
                  plan.highlight
                    ? 'border-periwinkle-500/50 bg-periwinkle-500/5 ring-1 ring-periwinkle-500/20'
                    : 'border-navy-700 bg-navy-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-periwinkle-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <button
                    onClick={handleStart}
                    className={`w-full flex items-center justify-center gap-2 h-10 rounded-lg font-semibold text-sm transition-colors ${
                      plan.highlight
                        ? 'bg-periwinkle-500 hover:bg-periwinkle-400 text-white'
                        : 'border border-navy-600 hover:bg-navy-700 text-white'
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight size={14} />
                  </button>
                  {plan.sub && <p className="text-xs text-slate-600 text-center mt-2">{plan.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section id="avis" className="py-16 px-5 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Avis</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Ce qu'en disent les utilisateurs.</h2>
          <p className="text-slate-400 text-sm mt-2">Laisse ton retour — ça aide les autres à se lancer.</p>
        </div>
        <ReviewSection />
      </section>

      {/* FAQ */}
      <section className="py-16 px-5 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Questions fréquentes.</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map(item => (
            <div key={item.q} className="rounded-xl border border-navy-700 bg-navy-800 px-5 py-4">
              <p className="text-sm font-semibold text-white mb-1.5">{item.q}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-5 text-center border-t border-navy-800 bg-navy-900/30">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-periwinkle-500/15 border border-periwinkle-500/30 flex items-center justify-center mx-auto mb-6">
            <Moon size={24} className="text-periwinkle-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ton espace calme t'attend.</h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">
            5 jours gratuits, sans carte bancaire.<br />
            Tu commences maintenant, tu arrêtes quand tu veux.
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold transition-colors"
          >
            Commencer maintenant
            <ArrowRight size={16} />
          </button>
          <p className="text-xs text-slate-600 mt-4">Sans engagement · Résiliable à tout moment</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={10} className="text-white" />
            </div>
            <span className="font-bold text-slate-400 tracking-widest">ASTER</span>
            <span>· Bien-être émotionnel</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#tarifs" className="hover:text-slate-400 transition-colors">Tarifs</a>
            <a href="#avis" className="hover:text-slate-400 transition-colors">Avis</a>
            <a href={SUPPORT_MAILTO} className="hover:text-slate-400 transition-colors">Contact</a>
            <button onClick={handleStart} className="hover:text-slate-400 transition-colors">Commencer</button>
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="hover:text-slate-400 transition-colors">Se connecter</button>
              </SignInButton>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <a href={SUPPORT_MAILTO} className="hover:text-slate-400 transition-colors">{SUPPORT_EMAIL}</a>
            <span>© 2026 ASTER. Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
