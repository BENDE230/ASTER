import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle2, ArrowRight, RotateCcw, LayoutDashboard } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApi } from '../hooks/useApi'

const OPTIONS = [
  { emoji: '🌀', label: 'Je suranalyse',      description: 'Les pensées tournent sans fin.',          protocol: 'ancrage-5-sens' },
  { emoji: '🧊', label: 'Je suis figé·e',      description: 'Je ne sais plus par où commencer.',      protocol: 'scan-corporel' },
  { emoji: '🪫', label: 'Je suis vidé·e',      description: "Plus d'énergie disponible.",             protocol: 'coherence-cardiaque' },
  { emoji: '🔺', label: 'Hypervigilance',      description: 'Mon corps est en alerte constante.',     protocol: 'protocole-securite' },
  { emoji: '🌊', label: 'Je me sens trop',     description: 'Les émotions débordent.',                protocol: 'auto-compassion' },
  { emoji: '🧠', label: 'Saturation mentale',  description: "Mon cerveau n'accepte plus rien.",       protocol: 'depose-mentale-soir' },
]

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

interface RecentCheckin {
  id: number
  feeling: string
  created_at: string
}

interface Stats {
  streak: number
  total_this_month: number
  week: { date: string; count: number; feeling: string | null }[]
  recent: RecentCheckin[]
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000)
  const diffD = Math.floor(diffH / 24)
  if (diffH < 1) return "Il y a moins d'une heure"
  if (diffH < 24) return `Il y a ${diffH}h`
  if (diffD === 1) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { post, get } = useApi()
  const [selected, setSelected] = useState<typeof OPTIONS[number] | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    get<Stats>('/api/checkins/stats')
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [])

  const handleValidate = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await post('/api/checkins', { feeling: selected.label })
    } catch {
      const prev = JSON.parse(localStorage.getItem('aster_checkins') ?? '[]')
      prev.unshift({ feeling: selected.label, date: new Date().toISOString() })
      localStorage.setItem('aster_checkins', JSON.stringify(prev.slice(0, 30)))
    } finally {
      setLoading(false)
    }
    get<Stats>('/api/checkins/stats').then(data => setStats(data)).catch(() => {})
    setDone(true)
  }

  // Success screen
  if (done && selected) {
    return (
      <div className="min-h-screen bg-navy-950 flex">
        <Sidebar />
        <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-lg pb-24 md:pb-8 flex flex-col justify-center">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-4">
              <div className="w-20 h-20 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center text-4xl">
                {selected.emoji}
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-navy-950 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check-in enregistré ✓</h1>
            <p className="text-slate-400 text-sm">
              Tu as exprimé : <span className="text-white font-semibold">{selected.label}</span>
            </p>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl border border-navy-700 bg-navy-800 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.streak}</p>
                <p className="text-xs text-slate-500 mt-0.5">Jours de suite 🔥</p>
              </div>
              <div className="rounded-xl border border-navy-700 bg-navy-800 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.total_this_month}</p>
                <p className="text-xs text-slate-500 mt-0.5">Check-ins ce mois</p>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="rounded-xl border border-periwinkle-500/30 bg-periwinkle-500/5 p-4 mb-6">
            <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Recommandé pour toi</p>
            <p className="text-sm text-slate-400 mb-3">Un protocole adapté à ton état :</p>
            <button
              onClick={() => navigate(`/protocols?open=${selected.protocol}`)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 hover:bg-navy-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-periwinkle-500/15 flex items-center justify-center">
                  <Clock size={14} className="text-periwinkle-400" />
                </div>
                <span className="text-sm font-semibold text-white">Lancer le protocole</span>
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setDone(false); setSelected(null) }}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:bg-navy-800 transition-colors text-sm"
            >
              <RotateCcw size={13} />
              Nouveau
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold text-sm transition-colors"
            >
              <LayoutDashboard size={13} />
              Tableau de bord
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <p className="text-xs text-slate-500 mb-2 font-medium">Check-in émotionnel</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Comment te sens-tu maintenant ?</h1>
          <p className="text-sm text-slate-400 mb-6">Sois honnête. Il n'y a pas de mauvaise réponse.</p>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_240px] gap-6">
            {/* Options */}
            <div>
              <div className="space-y-2 mb-6">
                {OPTIONS.map(opt => {
                  const isSelected = selected?.label === opt.label
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelected(opt)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-periwinkle-500 bg-periwinkle-500/8'
                          : 'border-navy-700 bg-navy-800 hover:border-navy-600 hover:bg-navy-700'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{opt.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex-shrink-0 transition-colors ${
                        isSelected ? 'border-periwinkle-500 bg-periwinkle-500' : 'border-slate-600'
                      }`}>
                        {isSelected && <span className="w-full h-full flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-white block" /></span>}
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleValidate}
                disabled={!selected || loading}
                className={`w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  selected && !loading
                    ? 'bg-periwinkle-500 hover:bg-periwinkle-400 text-white'
                    : 'bg-navy-800 text-slate-600 cursor-not-allowed border border-navy-700'
                }`}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enregistrement...</>
                ) : (
                  <>{selected ? `Valider — ${selected.label}` : 'Sélectionne un état'}{selected && <ArrowRight size={15} />}</>
                )}
              </button>
            </div>

            {/* Sidebar: stats + history */}
            <div className="space-y-4">
              {/* Week chart */}
              <div className="rounded-xl border border-navy-700 bg-navy-800 p-4">
                <p className="text-xs font-semibold text-slate-400 mb-3">Cette semaine</p>
                <div className="flex items-end gap-1.5 h-10 mb-2">
                  {loadingStats
                    ? Array(7).fill(0).map((_, i) => (
                      <div key={i} className="flex-1 bg-navy-700 rounded-sm animate-pulse h-2" />
                    ))
                    : DAYS.map((day, i) => {
                      const d = stats?.week[i]
                      const hasDone = d && d.count > 0
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1" title={d?.feeling ?? ''}>
                          <div
                            className={`w-full rounded-sm transition-all ${hasDone ? 'bg-periwinkle-500' : 'bg-navy-700'}`}
                            style={{ height: hasDone ? '100%' : '20%' }}
                          />
                          <span className="text-[10px] text-slate-600">{day}</span>
                        </div>
                      )
                    })
                  }
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>🔥 {stats?.streak ?? 0} jours de suite</span>
                  <span>{stats?.total_this_month ?? 0} ce mois</span>
                </div>
              </div>

              {/* Recent history */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">Historique récent</p>
                {loadingStats ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-12 bg-navy-800 rounded-lg animate-pulse border border-navy-700" />
                    ))}
                  </div>
                ) : !stats?.recent?.length ? (
                  <div className="rounded-xl border border-navy-700 bg-navy-800/50 px-3 py-5 text-center">
                    <p className="text-xs text-slate-500">Ton premier check-in sera affiché ici.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {stats.recent.slice(0, 6).map(c => {
                      const opt = OPTIONS.find(o => o.label === c.feeling)
                      return (
                        <div key={c.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-navy-700 bg-navy-800">
                          <span className="text-base flex-shrink-0">{opt?.emoji ?? '·'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-200 truncate">{c.feeling}</p>
                            <p className="text-xs text-slate-600">{formatRelative(c.created_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
