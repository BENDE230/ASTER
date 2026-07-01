import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk, useAuth } from '@clerk/clerk-react'
import { CheckCircle, Moon, HelpCircle, CheckSquare, BookOpen, Sparkles } from 'lucide-react'
import { useApi } from '../hooks/useApi'

const FEATURE_CARDS = [
  { icon: CheckSquare, label: 'Check-ins\nquotidiens' },
  { icon: BookOpen,    label: 'Protocoles\nguidés' },
  { icon: Sparkles,   label: 'Insights\npersonnels' },
]

const PROTOCOL_MAP: Record<string, string> = {
  'Submergé·e':   'exercices de régulation douce',
  'Anxieux·se':   'techniques de respiration apaisante',
  'Épuisé·e':     'protocoles de récupération douce',
  'Perdu·e':      'exercices d\'ancrage et de clarté',
  'Curieux·se':   'explorations guidées à ton rythme',
}

export default function SpaceReady() {
  const navigate = useNavigate()
  const { openSignUp } = useClerk()
  const { isSignedIn } = useAuth()
  const { post } = useApi()

  const raw = localStorage.getItem('aster_onboarding')
  const answers = raw ? JSON.parse(raw) : {}
  const feeling: string = answers.feeling ?? 'submergé·e'
  const protocol = PROTOCOL_MAP[feeling] ?? 'exercices personnalisés'

  useEffect(() => {
    if (isSignedIn && answers.feeling) {
      post('/api/onboarding', answers).catch(() => {})
    }
  }, [isSignedIn])

  const handleAccess = () => {
    if (isSignedIn) {
      navigate('/dashboard')
    } else {
      openSignUp({ afterSignUpUrl: '/dashboard', afterSignInUrl: '/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-periwinkle-600/8 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-col items-center gap-7 w-full max-w-xs text-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
            <Moon size={13} className="text-white" />
          </div>
          <span className="font-semibold tracking-widest text-sm">ASTER</span>
        </div>

        {/* Check icon */}
        <div className="w-14 h-14 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center">
          <CheckCircle size={28} className="text-periwinkle-400" />
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">Ton espace est prêt.</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            J'ai configuré ASTER pour toi. Puisque tu te sens{' '}
            <strong className="text-white">{feeling.toLowerCase()}</strong>,
            je commencerai par des {protocol}.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Tu as <strong className="text-white">5 jours</strong> pour explorer
            à ton rythme, sans rien à payer.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {FEATURE_CARDS.map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-xl border border-navy-700 bg-navy-800 p-3 flex flex-col items-center gap-2">
              <Icon size={18} className="text-periwinkle-400" />
              <span className="text-xs text-slate-400 leading-tight text-center whitespace-pre-line">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={handleAccess} className="btn-primary flex items-center justify-center gap-2">
          Accéder à mon espace
          <span>→</span>
        </button>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
