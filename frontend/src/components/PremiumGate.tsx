import { Lock } from 'lucide-react'

interface PremiumGateProps {
  title: string
  description?: string
  className?: string
}

export default function PremiumGate({ title, description, className = '' }: PremiumGateProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-navy-800/60 p-5 text-center ${className}`}>
      <Lock size={16} className="text-amber-400" />
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <button className="mt-1 px-4 py-1.5 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-xs font-semibold transition-colors">
        Débloquer
      </button>
    </div>
  )
}
