import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, HelpCircle } from 'lucide-react'
import OptionCard from '../components/OptionCard'

const STEPS = [
  {
    title: 'Comment te sens-tu en ce moment ?',
    subtitle: 'Sois honnête — personne ne juge ici.',
    key: 'feeling',
    options: [
      { icon: '🌊', label: 'Submergé·e' },
      { icon: '⚡', label: 'Anxieux·se' },
      { icon: '🔥', label: 'Épuisé·e' },
      { icon: '〰️', label: 'Perdu·e' },
      { icon: '✨', label: 'Curieux·se' },
    ],
  },
  {
    title: 'Depuis combien de temps tu te sens comme ça ?',
    subtitle: "Ça m'aide à mieux calibrer ton espace.",
    key: 'duration',
    options: [
      { icon: '🕐', label: 'Juste aujourd\'hui' },
      { icon: '📅', label: 'Quelques jours' },
      { icon: '📆', label: 'Depuis quelques semaines' },
      { icon: '🌙', label: 'Depuis longtemps' },
    ],
  },
  {
    title: "Qu'est-ce qui t'a amené·e ici ?",
    subtitle: "Il n'y a pas de mauvaise réponse.",
    key: 'reason',
    options: [
      { icon: '🧠', label: 'Surcharge mentale' },
      { icon: '💭', label: 'Anxiété chronique' },
      { icon: '🌸', label: 'Hypersensibilité' },
      { icon: '🔋', label: 'Burn-out ou épuisement' },
      { icon: '🌙', label: 'Problèmes de sommeil' },
      { icon: '🔍', label: 'Juste voir ce que c\'est' },
    ],
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = STEPS[step]
  const selected = answers[current.key]

  const handleContinue = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      localStorage.setItem('aster_onboarding', JSON.stringify(answers))
      navigate('/space-ready')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 relative">
      <main className="relative z-10 flex flex-col gap-6 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={13} className="text-white" />
            </div>
            <span className="font-semibold tracking-widest text-sm">ASTER</span>
          </div>
        </div>

        {/* Step indicator */}
        <p className="text-sm text-slate-500 font-medium">{step + 1} / {STEPS.length}</p>

        {/* Question */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold leading-snug text-white">{current.title}</h2>
          <p className="text-sm text-slate-400">{current.subtitle}</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {current.options.map(opt => (
            <OptionCard
              key={opt.label}
              icon={opt.icon}
              label={opt.label}
              selected={selected === opt.label}
              onClick={() => setAnswers(a => ({ ...a, [current.key]: opt.label }))}
            />
          ))}
        </div>

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="btn-primary"
        >
          Continuer
        </button>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
