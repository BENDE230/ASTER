import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
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

const FEELING_PROTOCOL: Record<string, { protocol: string; path: string }> = {
  'Je suranalyse':      { protocol: 'Ancrage par les 5 sens', path: '/protocols' },
  'Je suis figé·e':    { protocol: 'Scan corporel doux', path: '/protocols' },
  'Je suis vidé·e':    { protocol: 'Cohérence cardiaque 4–6', path: '/protocols' },
  'Hypervigilance':    { protocol: 'Protocole de sécurité', path: '/protocols' },
  'Je me sens trop':   { protocol: 'Auto-compassion rapide', path: '/protocols' },
  'Saturation mentale':{ protocol: 'Dépose mentale du soir', path: '/protocols' },
}

const FEELING_ICON: Record<string, string> = {
  'Je suranalyse':      '⏱',
  'Je suis figé·e':    '○',
  'Je suis vidé·e':    '≈',
  'Hypervigilance':    '⚠',
  'Je me sens trop':   '♡',
  'Saturation mentale':'⚡',
}

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
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffH < 1) return "Il y a moins d'une heure"
  if (diffH < 24) return `Il y a ${diffH}h`
  if (diffD === 1) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { post, get } = useApi()
  const [selected, setSelected] = useState<string | null>(null)
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
      await post('/api/checkins', { feeling: selected })
    } catch {
      const prev = JSON.parse(localStorage.getItem('aster_checkins') ?? '[]')
      prev.unshift({ feeling: selected, date: new Date().toISOString() })
      localStorage.setItem('aster_checkins', JSON.stringify(prev.slice(0, 30)))
    } finally {
      setLoading(false)
    }
    // Refresh stats
    get<Stats>('/api/checkins/stats')
      .then(data => setStats(data))
      .catch(() => {})
    setDone(true)
  }

  const recommended = selected ? FEELING_PROTOCOL[selected] : null
  const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

  if (done && selected) {
    return (
      <div className="min-h-screen bg-navy-950 flex">
        <Sidebar />
        <main className="ml-[210px] flex-1 px-8 py-8 max-w-lg">
          {/* Success */}
          <div className="text-center py-8 mb-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check-in enregistré</h1>
            <p className="text-slate-400 text-sm">
              Tu as exprimé : <span className="text-white font-medium">{selected}</span>
            </p>
          </div>

          {/* Recommandation */}
          {recommended && (
            <div className="rounded-xl border border-periwinkle-500/30 bg-periwinkle-500/5 px-5 py-4 mb-6">
              <p className="text-xs text-periwinkle-400 font-semibold uppercase tracking-widest mb-2">Recommandé pour toi</p>
              <p className="text-sm text-slate-300 mb-3">
                Pour <span className="text-white font-medium">"{selected}"</span>, essaie ce protocole :
              </p>
              <button
                onClick={() => navigate(recommended.path)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 hover:bg-navy-700 transition-colors"
              >
                <span className="text-sm font-semibold text-white">{recommended.protocol}</span>
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => { setDone(false); setSelected(null) }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:bg-navy-800 transition-colors text-sm"
            >
              Nouveau check-in
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold text-sm transition-colors"
            >
              Tableau de bord
            </button>
          </div>
        </main>
        <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <HelpCircle size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-2xl">
        <div className="grid grid-cols-[1fr_260px] gap-6">
          {/* Left: form */}
          <div>
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
          </div>

          {/* Right: history */}
          <div>
            {/* Mini week chart */}
            <div className="rounded-xl border border-navy-700 bg-navy-800 p-4 mb-4">
              <p className="text-xs font-semibold text-slate-400 mb-3">Cette semaine</p>
              <div className="flex items-end gap-1.5 h-10 mb-2">
                {loadingStats
                  ? Array(7).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 bg-navy-700 rounded-sm animate-pulse h-2" />
                  ))
                  : DAYS.map((day, i) => {
                    const d = stats?.week[i]
                    const done = d && d.count > 0
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1" title={d?.feeling ?? ''}>
                        <div
                          className={`w-full rounded-sm transition-all ${done ? 'bg-periwinkle-500' : 'bg-navy-700'}`}
                          style={{ height: done ? '100%' : '20%' }}
                        />
                        <span className="text-xs text-slate-600">{day}</span>
                      </div>
                    )
                  })
                }
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{stats?.streak ?? 0} jours de suite</span>
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
                <div className="rounded-lg border border-navy-700 bg-navy-800/50 px-3 py-4 text-center">
                  <p className="text-xs text-slate-500">Aucun check-in encore.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {stats.recent.slice(0, 6).map(c => (
                    <div key={c.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-navy-700 bg-navy-800">
                      <span className="text-base flex-shrink-0">{FEELING_ICON[c.feeling] ?? '·'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-200 truncate">{c.feeling}</p>
                        <p className="text-xs text-slate-600">{formatRelative(c.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
