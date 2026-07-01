import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import OptionCard from '../components/OptionCard'
import { useApi } from '../hooks/useApi'

const OPTIONS = [
  { icon: '⏱', label: 'Je suranalyse',      description: 'Les pensées tournent sans fin.' },
  { icon: '○', label: 'Je suis figé·e',      description: 'Je ne sais plus par où commencer.' },
  { icon: '≈', label: 'Je suis vidé·e',      description: "Plus d'énergie disponible." },
  { icon: '⚠', label: 'Hypervigilance',      description: 'Mon corps est en alerte constante.' },
  { icon: '♡', label: 'Je me sens trop',     description: 'Les émotions débordent.' },
  { icon: '⚡', label: 'Saturation mentale', description: "Mon cerveau n'accepte plus rien." },
]

export default function CheckIn() {
  const navigate = useNavigate()
  const { post } = useApi()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleValidate = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await post('/api/checkins', { feeling: selected })
    } catch {
      const prev = JSON.parse(localStorage.getItem('aster_checkins') ?? '[]')
      prev.unshift({ feeling: selected, date: new Date().toISOString() })
      localStorage.setItem('aster_checkins', JSON.stringify(prev.slice(0, 30)))
    } finally {
      setLoading(false)
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-lg">
        <p className="text-xs text-slate-500 mb-2 font-medium">Check-in émotionnel</p>
        <h1 className="text-3xl font-bold text-white mb-1">Comment te sens-tu maintenant ?</h1>
        <p className="text-sm text-slate-400 mb-7">Sois honnête. Il n'y a pas de mauvaise réponse.</p>

        <div className="space-y-2 mb-7">
          {OPTIONS.map(opt => (
            <OptionCard
              key={opt.label}
              icon={opt.icon}
              label={opt.label}
              description={opt.description}
              selected={selected === opt.label}
              onClick={() => setSelected(opt.label)}
            />
          ))}
        </div>

        <button
          onClick={handleValidate}
          disabled={!selected || loading}
          className="btn-primary"
        >
          {loading ? 'Enregistrement...' : 'Valider'}
        </button>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
