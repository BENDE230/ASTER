import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  streak: number
  onClose: () => void
}

const MILESTONES: Record<number, { emoji: string; title: string; message: string }> = {
  3:  { emoji: '🔥', title: '3 jours de suite !',     message: 'Tu prends soin de toi depuis 3 jours. C\'est le début d\'une belle habitude.' },
  7:  { emoji: '⭐', title: 'Une semaine complète !',  message: 'Une semaine entière de check-ins. Ton engagement est réel et ça se voit.' },
  14: { emoji: '💜', title: 'Deux semaines !',         message: 'Deux semaines à t\'écouter chaque jour. Tu construis quelque chose de solide.' },
  21: { emoji: '🌙', title: '21 jours — une habitude', message: 'La science dit que 21 jours suffisent à ancrer une habitude. Tu l\'as fait.' },
  30: { emoji: '✨', title: 'Un mois entier !',        message: 'Un mois de présence à toi-même. C\'est rare et précieux. Félicitations.' },
  60: { emoji: '🎯', title: '60 jours !',              message: 'Deux mois sans t\'arrêter. Ta constance est impressionnante.' },
  90: { emoji: '🏆', title: '90 jours — exceptionnel', message: 'Trois mois. Tu es passé·e d\'un outil à une vraie pratique de vie.' },
}

const PARTICLES = ['✦', '✧', '⋆', '✦', '✧', '⋆', '·', '✦', '·', '✧']

export default function StreakCelebration({ streak, onClose }: Props) {
  const milestone = MILESTONES[streak]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  if (!milestone) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-5 transition-all duration-300 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-xs bg-navy-900 border border-navy-700 rounded-2xl p-7 text-center shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden>
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute text-periwinkle-400/40 animate-pulse text-xs"
              style={{
                top: `${10 + (i * 9) % 80}%`,
                left: `${5 + (i * 17) % 90}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              }}
            >
              {p}
            </span>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="text-5xl mb-4">{milestone.emoji}</div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-periwinkle-500/15 border border-periwinkle-500/30 mb-4">
          <span className="text-sm font-bold text-white">{streak}</span>
          <span className="text-xs text-periwinkle-400 font-medium">jours de suite 🔥</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{milestone.title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{milestone.message}</p>

        <button
          onClick={handleClose}
          className="w-full h-10 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold text-sm transition-colors"
        >
          Continuer →
        </button>
      </div>
    </div>
  )
}
