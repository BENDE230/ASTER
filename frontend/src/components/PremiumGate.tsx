import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useToast } from './Toast'
import { AnalyticsEvents, track } from '../lib/analytics'

interface PremiumGateProps {
  title: string
  description?: string
  className?: string
}

export default function PremiumGate({ title, description, className = '' }: PremiumGateProps) {
  const { post } = useApi()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (loading) return
    setLoading(true)
    track(AnalyticsEvents.PREMIUM_CHECKOUT_CLICKED, { plan: 'yearly', source: 'premium_gate' })
    try {
      const data = await post<{ url: string }>('/api/stripe/create-checkout?plan=yearly', {})
      if (data?.url) window.location.href = data.url
    } catch {
      toast.error('Impossible de créer le paiement. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-navy-800/60 p-5 text-center ${className}`}>
      <Lock size={16} className="text-amber-400" />
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="mt-1 px-4 py-1.5 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
      >
        {loading ? 'Redirection...' : 'Débloquer'}
      </button>
    </div>
  )
}
