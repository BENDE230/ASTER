import { useNavigate } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import {
  Moon, CheckCircle, Brain, Shield, Sparkles, BookOpen,
  ChevronRight, Star, ArrowRight, Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icon: CheckCircle,
    color: 'text-emerald-400 bg-emerald-400/10',
    title: 'Check-in émotionnel quotidien',
    desc: 'En 30 secondes, identifie ce que tu ressens. ASTER adapte ton parcours en temps réel.',
  },
  {
    icon: BookOpen,
    color: 'text-violet-400 bg-violet-400/10',
    title: 'Journal avec analyse IA',
    desc: 'Écris librement. L\'IA détecte ton émotion dominante, ton besoin, et te propose un exercice.',
  },
  {
    icon: Shield,
    color: 'text-blue-400 bg-blue-400/10',
    title: 'Protocoles de régulation',
    desc: 'Cohérence cardiaque, ancrage, scan corporel... Des exercices guidés adaptés à ton état.',
  },
  {
    icon: Brain,
    color: 'text-rose-400 bg-rose-400/10',
    title: 'Insights personnalisés',
    desc: 'Visualise tes patterns émotionnels sur la semaine. Comprends ce qui déclenche tes états.',
  },
]

const STEPS = [
  { num: '01', title: 'Dis comment tu te sens', desc: 'Un check-in rapide tous les jours — 30 secondes.' },
  { num: '02', title: 'Reçois un protocole', desc: 'Un exercice adapté à ton état, guidé pas à pas.' },
  { num: '03', title: 'Écris dans ton journal', desc: 'L\'IA analyse tes entrées et identifie tes besoins.' },
  { num: '04', title: 'Lis tes patterns', desc: 'Chaque semaine, une synthèse de ton évolution émotionnelle.' },
]

const TESTIMONIALS = [
  {
    name: 'Camille R.',
    role: 'Enseignante, 29 ans',
    text: 'J\'avais du mal à nommer ce que je ressentais. ASTER m\'a appris à m\'écouter sans me juger.',
    stars: 5,
  },
  {
    name: 'Thomas L.',
    role: 'Développeur, 34 ans',
    text: 'Le protocole de cohérence cardiaque m\'a changé la vie. Je le fais chaque matin avant le travail.',
    stars: 5,
  },
  {
    name: 'Sarah M.',
    role: 'Infirmière, 27 ans',
    text: 'Après des gardes difficiles, le journal + l\'analyse IA me permet de vraiment déposer la journée.',
    stars: 5,
  },
]

const PLANS = [
  {
    name: 'Essai gratuit',
    price: '0€',
    period: '5 jours',
    highlight: false,
    features: [
      '3 protocoles de régulation',
      'Check-in émotionnel quotidien',
      '1 entrée de journal visible',
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
    features: [
      'Tout l\'essai gratuit',
      '6 protocoles (dont Sommeil & Sécurité)',
      'Analyse IA du journal',
      'Historique complet',
      'Insights & patterns avancés',
      'Note de la semaine par l\'IA',
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

export default function Landing() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  const handleStart = () => {
    navigate(isSignedIn ? '/dashboard' : '/onboarding')
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-navy-800 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={13} className="text-white" />
            </div>
            <span className="font-semibold tracking-widest text-sm">ASTER</span>
          </div>
          <div className="flex items-center gap-3">
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
                  Commencer
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-periwinkle-600/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-violet-600/8 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-periwinkle-500/30 bg-periwinkle-500/5 text-periwinkle-400 text-xs font-medium mb-6">
            <Zap size={11} />
            5 jours gratuits · Sans carte bancaire
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5">
            Ton espace calme,{' '}
            <span className="text-periwinkle-400">quand tu en as besoin.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto">
            ASTER t'accompagne quand ton mental s'emballe, quand tu ressens trop,
            quand tu as besoin de redescendre. Des outils concrets. Pas de jugement.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 h-12 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold transition-colors text-base"
            >
              Commencer mon espace
              <ArrowRight size={16} />
            </button>
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="px-6 h-12 rounded-xl border border-navy-600 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors text-sm font-medium">
                  Déjà un compte
                </button>
              </SignInButton>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Rejoint les personnes qui ont retrouvé leur calme intérieur
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Ce qu'ASTER propose</p>
          <h2 className="text-3xl font-bold">Tout ce dont tu as besoin pour aller mieux.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-xl border border-navy-700 bg-navy-800 p-5 flex gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${f.color}`}>
                <f.icon size={18} />
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
      <section className="py-16 px-6 bg-navy-900/50 border-y border-navy-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Comment ça marche</p>
            <h2 className="text-3xl font-bold">Simple. Quotidien. Efficace.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-navy-700 z-0" style={{ width: 'calc(100% - 20px)', left: 'calc(50% + 20px)' }} />
                )}
                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-periwinkle-500/15 border border-periwinkle-500/30 flex items-center justify-center text-xs font-bold text-periwinkle-400">
                    {step.num}
                  </div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Témoignages</p>
          <h2 className="text-3xl font-bold">Ils ont retrouvé leur calme.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-xl border border-navy-700 bg-navy-800 p-5 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array(t.stars).fill(0).map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1 italic">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-16 px-6 bg-navy-900/50 border-y border-navy-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Tarifs</p>
            <h2 className="text-3xl font-bold">Commence gratuitement. Évolue à ton rythme.</h2>
            <p className="text-slate-400 text-sm mt-2">5 jours d'essai gratuit · Sans carte bancaire</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col gap-5 ${
                  plan.highlight
                    ? 'border-periwinkle-500/60 bg-periwinkle-500/5 shadow-lg shadow-periwinkle-500/10'
                    : 'border-navy-700 bg-navy-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-periwinkle-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
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

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-periwinkle-500/15 border border-periwinkle-500/30 flex items-center justify-center mx-auto mb-6">
            <Moon size={24} className="text-periwinkle-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Prêt·e à commencer ?</h2>
          <p className="text-slate-400 text-sm mb-7 leading-relaxed">
            Ton espace calme t'attend. 5 jours gratuits, sans carte bancaire.<br />
            Tu peux arrêter à tout moment.
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold transition-colors"
          >
            Commencer maintenant
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={10} className="text-white" />
            </div>
            <span className="font-semibold text-slate-400">ASTER</span>
            <span>· Bien-être émotionnel</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#tarifs" className="hover:text-slate-400 transition-colors">Tarifs</a>
            <button onClick={handleStart} className="hover:text-slate-400 transition-colors">Commencer</button>
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="hover:text-slate-400 transition-colors">Se connecter</button>
              </SignInButton>
            )}
          </div>
          <span>© 2026 ASTER. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  )
}
