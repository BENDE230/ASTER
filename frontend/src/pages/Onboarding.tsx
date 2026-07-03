import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, ChevronLeft, ArrowRight } from 'lucide-react'
import { AnalyticsEvents, track } from '../lib/analytics'

const STEPS = [
  {
    title: 'Comment te sens-tu en ce moment ?',
    subtitle: 'Sois honnête — personne ne juge ici.',
    key: 'feeling',
    grid: true,
    options: [
      { icon: '🌊', label: 'Submergé·e' },
      { icon: '⚡', label: 'Anxieux·se' },
      { icon: '🔥', label: 'Épuisé·e' },
      { icon: '〰️', label: 'Perdu·e' },
      { icon: '✨', label: 'Curieux·se' },
      { icon: '😶‍🌫️', label: 'Déconnecté·e' },
    ],
  },
  {
    title: 'Depuis combien de temps tu te sens comme ça ?',
    subtitle: "Ça m'aide à mieux calibrer ton espace.",
    key: 'duration',
    grid: false,
    options: [
      { icon: '🕐', label: "Juste aujourd'hui" },
      { icon: '📅', label: 'Quelques jours' },
      { icon: '📆', label: 'Depuis quelques semaines' },
      { icon: '🌙', label: 'Depuis longtemps' },
    ],
  },
  {
    title: "Qu'est-ce qui t'a amené·e ici ?",
    subtitle: "Il n'y a pas de mauvaise réponse.",
    key: 'reason',
    grid: true,
    options: [
      { icon: '🧠', label: 'Surcharge mentale' },
      { icon: '💭', label: 'Anxiété chronique' },
      { icon: '🌸', label: 'Hypersensibilité' },
      { icon: '🔋', label: 'Burn-out' },
      { icon: '🌙', label: 'Sommeil difficile' },
      { icon: '🔍', label: 'Par curiosité' },
    ],
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  // -1 = intro screen
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = step >= 0 ? STEPS[step] : null
  const selected = current ? answers[current.key] : null
  const totalSteps = STEPS.length

  const handleContinue = () => {
    if (!current) return
    track(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
      step: step + 1,
      key: current.key,
      answer: answers[current.key],
    })

    if (step < totalSteps - 1) {
      setStep(s => s + 1)
    } else {
      track(AnalyticsEvents.ONBOARDING_COMPLETED, answers)
      localStorage.setItem('aster_onboarding', JSON.stringify(answers))
      navigate('/space-ready')
    }
  }

  const handleBack = () => {
    if (step === 0) setStep(-1)
    else setStep(s => s - 1)
  }

  // Intro screen
  if (step === -1) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm flex flex-col items-center text-center gap-7">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={15} className="text-white" />
            </div>
            <span className="font-bold tracking-widest text-sm">ASTER</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-periwinkle-500/10 border border-periwinkle-500/20 flex items-center justify-center">
            <span className="text-4xl">🌙</span>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white leading-snug">
              Bienvenue.<br />Prends une grande respiration.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              On va prendre 1 minute pour préparer ton espace personnel.
              3 questions simples — pas de jugement, pas de mauvaise réponse.
            </p>
          </div>

          {/* Trust */}
          <div className="w-full grid grid-cols-3 gap-2 text-center">
            {[
              { emoji: '🔒', text: 'Privé' },
              { emoji: '⏱️', text: '1 minute' },
              { emoji: '💜', text: 'Sans jugement' },
            ].map(item => (
              <div key={item.text} className="rounded-xl border border-navy-700 bg-navy-800 py-3 px-2 flex flex-col items-center gap-1.5">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-xs text-slate-400 font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              track(AnalyticsEvents.ONBOARDING_STARTED)
              setStep(0)
            }}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold transition-colors"
          >
            Commencer
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-lg border border-navy-700 bg-navy-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Logo centered */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-periwinkle-500 flex items-center justify-center">
              <Moon size={11} className="text-white" />
            </div>
            <span className="font-bold tracking-widest text-xs text-slate-400">ASTER</span>
          </div>

          {/* Step count */}
          <span className="text-xs text-slate-500 font-medium w-9 text-right">{step + 1}/{totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-periwinkle-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="space-y-1 pt-1">
          <h2 className="text-xl font-bold leading-snug text-white">{current!.title}</h2>
          <p className="text-sm text-slate-400">{current!.subtitle}</p>
        </div>

        {/* Options */}
        {current!.grid ? (
          <div className="grid grid-cols-2 gap-2">
            {current!.options.map(opt => {
              const isSelected = selected === opt.label
              return (
                <button
                  key={opt.label}
                  onClick={() => setAnswers(a => ({ ...a, [current!.key]: opt.label }))}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-periwinkle-500 bg-periwinkle-500/10 text-white'
                      : 'border-navy-700 bg-navy-800 text-slate-300 hover:border-navy-600 hover:bg-navy-700'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-medium leading-tight">{opt.label}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {current!.options.map(opt => {
              const isSelected = selected === opt.label
              return (
                <button
                  key={opt.label}
                  onClick={() => setAnswers(a => ({ ...a, [current!.key]: opt.label }))}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-periwinkle-500 bg-periwinkle-500/10'
                      : 'border-navy-700 bg-navy-800 hover:border-navy-600 hover:bg-navy-700'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{opt.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {opt.label}
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-periwinkle-500 bg-periwinkle-500' : 'border-slate-600'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            selected
              ? 'bg-periwinkle-500 hover:bg-periwinkle-400 text-white'
              : 'bg-navy-800 text-slate-600 cursor-not-allowed border border-navy-700'
          }`}
        >
          {step === totalSteps - 1 ? 'Voir mon espace' : 'Continuer'}
          {selected && <ArrowRight size={15} />}
        </button>

      </div>
    </div>
  )
}
