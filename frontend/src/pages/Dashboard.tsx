import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Flame, Clock, BookOpen, TrendingUp, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApi } from '../hooks/useApi'

const PROTOCOLS = [
  { id: 'ancrage-5-sens',       tag: 'Anti-rumination', tagColor: 'text-violet-400 bg-violet-400/10',   duration: '3 min', title: 'Ancrage par les 5 sens' },
  { id: 'coherence-cardiaque',  tag: 'Respiration',     tagColor: 'text-blue-400 bg-blue-400/10',       duration: '5 min', title: 'Cohérence cardiaque 4–6' },
  { id: 'scan-corporel',        tag: 'Retour au corps', tagColor: 'text-emerald-400 bg-emerald-400/10', duration: '7 min', title: 'Scan corporel doux' },
  { id: 'protocole-securite',   tag: 'Hypervigilance',  tagColor: 'text-rose-400 bg-rose-400/10',       duration: '4 min', title: 'Protocole de sécurité' },
]

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

interface Stats {
  streak: number
  total_this_month: number
  week: { date: string; calm_avg: number | null; count: number; feeling: string | null }[]
  recent: { id: number; feeling: string; created_at: string }[]
}

const FEELING_ICON: Record<string, string> = {
  'Je suranalyse':      '🌀',
  'Je suis figé·e':    '🧊',
  'Je suis vidé·e':    '🪫',
  'Hypervigilance':    '🔺',
  'Je me sens trop':   '🌊',
  'Saturation mentale':'🧠',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonne soirée'
}

function getJournalLabel() {
  const h = new Date().getHours()
  if (h < 12) return { title: 'Journal du matin', subtitle: 'Écrire comment tu commences la journée' }
  if (h < 18) return { title: 'Journal de l\'après-midi', subtitle: 'Déposer ce qui s\'est passé aujourd\'hui' }
  return { title: 'Journal du soir', subtitle: 'Écrire ce qui reste avant de dormir' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { get, post } = useApi()
  const firstName = user?.firstName ?? 'toi'

  const [stats, setStats] = useState<Stats>({ streak: 0, total_this_month: 0, week: [], recent: [] })
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const journalLabel = getJournalLabel()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      post<{ is_premium: boolean }>('/api/stripe/activate-premium', {})
        .then(data => { if (data?.is_premium) setIsPremium(true) })
        .catch(() => {})
      window.history.replaceState({}, '', '/dashboard')
    } else {
      get<{ is_premium: boolean }>('/api/stripe/user-status')
        .then(data => { if (data?.is_premium) setIsPremium(true) })
        .catch(() => {})
    }
  }, [])

  const fetchStats = () => {
    get<Stats>('/api/checkins/stats')
      .then(data => {
        setStats(data)
        const today = new Date().toISOString().slice(0, 10)
        setCheckedInToday(data.week.some(d => d.date === today && d.calm_avg !== null))
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStats()
    // Refresh on window focus
    window.addEventListener('focus', fetchStats)
    return () => window.removeEventListener('focus', fetchStats)
  }, [])

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar isPremium={isPremium} />

      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-3xl pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getGreeting()}, {firstName} 🌿
          </h1>
          <p className="text-sm text-slate-400 mt-1">
          {checkedInToday ? 'Check-in du jour complété ✓' : "Tu n'as pas encore fait ton check-in aujourd'hui."}
        </p>
        </div>

        {/* Check-in CTA */}
        <button
          onClick={() => navigate('/checkin')}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors mb-5 text-left ${
            checkedInToday
              ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/8'
              : 'border-navy-700 bg-navy-800 hover:bg-navy-700'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            checkedInToday ? 'bg-emerald-500/15' : 'bg-periwinkle-500/15'
          }`}>
            {checkedInToday
              ? <span className="text-lg">✓</span>
              : <Clock size={18} className="text-periwinkle-400" />
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {checkedInToday ? 'Check-in du jour complété' : 'Comment te sens-tu maintenant ?'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {checkedInToday ? 'Tu peux en faire un nouveau si tu le souhaites' : '30 secondes · Protocole personnalisé ensuite'}
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { emoji: '🔥', value: stats.streak,           label: 'Jours de suite' },
            { emoji: '📊', value: stats.total_this_month, label: 'Check-ins ce mois' },
            { emoji: '📓', value: stats.recent?.length ?? 0, label: 'Activités récentes' },
          ].map(({ emoji, value, label }) => (
            <div key={label} className="stat-card">
              <span className="text-base">{emoji}</span>
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Emotional week */}
        <div className="rounded-xl border border-navy-700 bg-navy-800 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">Semaine émotionnelle</p>
              <p className="text-xs text-slate-500">Calme perçu · de 1 à 10</p>
            </div>
            <TrendingUp size={16} className="text-periwinkle-400" />
          </div>
          <div className="flex items-end gap-2 h-14">
            {DAYS.map((day, i) => {
              const dayData = stats.week[i]
              const hasData = dayData?.count > 0
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={dayData?.feeling ?? ''}>
                  <div
                    className={`w-full rounded-sm transition-all ${hasData ? 'bg-periwinkle-500' : 'bg-navy-700'}`}
                    style={{ height: hasData ? '100%' : '8%', minHeight: '4px' }}
                  />
                  <span className="text-xs text-slate-600">{day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommended protocols */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Recommandé pour toi</p>
            <button onClick={() => navigate('/protocols')} className="text-xs text-periwinkle-400 hover:text-periwinkle-300 transition-colors">Tout voir</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PROTOCOLS.map(p => (
              <button
                key={p.title}
                onClick={() => navigate(`/protocols?open=${p.id}`)}
                className="text-left rounded-xl border border-navy-700 bg-navy-800 hover:bg-navy-700 active:scale-95 transition-all p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.tagColor}`}>{p.tag}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={11} />{p.duration}</span>
                </div>
                <p className="text-sm font-semibold text-white">{p.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Journal CTA */}
        <button
          onClick={() => navigate('/journal')}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-navy-700 bg-navy-800 hover:bg-navy-700 transition-colors mb-5 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{journalLabel.title}</p>
            <p className="text-xs text-slate-500">{journalLabel.subtitle}</p>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>

        {/* Recent activity */}
        <div>
          <p className="section-title mb-3">Activité récente</p>
          <div className="space-y-2">
            {!stats.recent?.length ? (
              <p className="text-sm text-slate-500 italic px-1">Aucune activité pour l'instant. Fais ton premier check-in !</p>
            ) : (
              stats.recent.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-navy-700 bg-navy-800">
                  <span className="text-base flex-shrink-0">{FEELING_ICON[c.feeling] ?? '·'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{c.feeling}</p>
                    <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
