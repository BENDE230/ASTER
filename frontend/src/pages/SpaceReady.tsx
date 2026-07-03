import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk, useAuth } from '@clerk/clerk-react'
import { Moon, ArrowRight, CheckCircle2, BookOpen, Sparkles, Shield } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { AnalyticsEvents, track } from '../lib/analytics'

const PROTOCOL_MAP: Record<string, { protocol: string; emoji: string }> = {
  'Submergé·e':    { protocol: 'exercices de régulation douce', emoji: '🌊' },
  'Anxieux·se':    { protocol: 'techniques de respiration apaisante', emoji: '⚡' },
  'Épuisé·e':      { protocol: 'protocoles de récupération douce', emoji: '🔥' },
  'Perdu·e':       { protocol: "exercices d'ancrage et de clarté", emoji: '〰️' },
  'Curieux·se':    { protocol: 'explorations guidées à ton rythme', emoji: '✨' },
  'Déconnecté·e':  { protocol: 'exercices de reconnexion au corps', emoji: '😶‍🌫️' },
}

const FEATURES = [
  { icon: CheckCircle2, label: 'Check-in\nquotidien',   color: 'text-emerald-400' },
  { icon: Shield,       label: '12 protocoles\nguidés', color: 'text-blue-400' },
  { icon: BookOpen,     label: 'Journal\nintelligent',  color: 'text-violet-400' },
  { icon: Sparkles,     label: 'Insights\nIA',          color: 'text-amber-400' },
]

export default function SpaceReady() {
  const navigate = useNavigate()
  const { openSignUp } = useClerk()
  const { isSignedIn } = useAuth()
  const { post } = useApi()

  const raw = localStorage.getItem('aster_onboarding')
  const answers = raw ? JSON.parse(raw) : {}
  const feeling: string = answers.feeling ?? 'Submergé·e'
  const mapped = PROTOCOL_MAP[feeling] ?? { protocol: 'exercices personnalisés', emoji: '🌙' }

  useEffect(() => {
    if (isSignedIn && answers.feeling) {
      post('/api/onboarding', answers).catch(() => {})
    }
  }, [isSignedIn])

  const handleAccess = () => {
    if (isSignedIn) {
      track(AnalyticsEvents.CTA_CLICKED, { location: 'space_ready', signed_in: true })
      navigate('/dashboard')
    } else {
      track(AnalyticsEvents.SIGNUP_STARTED, { feeling })
      openSignUp({ afterSignUpUrl: '/dashboard', afterSignInUrl: '/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-periwinkle-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
            <Moon size={13} className="text-white" />
          </div>
          <span className="font-bold tracking-widest text-sm">ASTER</span>
        </div>

        {/* Main icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-periwinkle-500/10 border border-periwinkle-500/25 flex items-center justify-center">
            <span className="text-4xl">{mapped.emoji}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-navy-950 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        </div>

        {/* Copy */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-white">Ton espace est prêt. ✨</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Puisque tu te sens{' '}
            <span className="text-white font-semibold">{feeling.toLowerCase()}</span>,
            je commencerai par des{' '}
            <span className="text-periwinkle-400 font-medium">{mapped.protocol}</span>.
          </p>
        </div>

        {/* Trial badge */}
        <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-periwinkle-500/30 bg-periwinkle-500/5">
          <span className="text-xl">🎁</span>
          <div>
            <p className="text-sm font-semibold text-white">5 jours d'essai gratuit</p>
            <p className="text-xs text-slate-400">Sans carte bancaire · Résiliable à tout moment</p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="w-full grid grid-cols-4 gap-2">
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div key={label} className="rounded-xl border border-navy-700 bg-navy-800 py-3 px-1 flex flex-col items-center gap-2">
              <Icon size={16} className={color} />
              <span className="text-[10px] text-slate-400 leading-tight text-center whitespace-pre-line">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleAccess}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold transition-colors"
        >
          Accéder à mon espace
          <ArrowRight size={16} />
        </button>

        <p className="text-xs text-slate-600 text-center">
          {isSignedIn ? 'Ton compte est déjà connecté.' : 'Tu créeras ton compte en 1 clic pour sauvegarder tes données.'}
        </p>

      </div>
    </div>
  )
}
