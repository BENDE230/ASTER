import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Flame, Clock, BookOpen, TrendingUp, ChevronRight, HelpCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApi } from '../hooks/useApi'

const PROTOCOLS = [
  { tag: 'Anti-rumination', tagColor: 'text-violet-400 bg-violet-400/10', duration: '3 min', title: 'Ancrage par les 5 sens' },
  { tag: 'Respiration',     tagColor: 'text-blue-400 bg-blue-400/10',     duration: '5 min', title: 'Cohérence cardiaque 4–6' },
  { tag: 'Retour au corps', tagColor: 'text-emerald-400 bg-emerald-400/10', duration: '7 min', title: 'Scan corporel doux' },
  { tag: 'Hypervigilance',  tagColor: 'text-rose-400 bg-rose-400/10',     duration: '4 min', title: 'Protocole de sécurité' },
]

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

interface Stats {
  streak: number
  total_this_month: number
  week: { date: string; calm_avg: number | null }[]
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonne soirée'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { get } = useApi()
  const firstName = user?.firstName ?? 'toi'

  const [stats, setStats] = useState<Stats>({ streak: 0, total_this_month: 0, week: [] })
  const [checkedInToday, setCheckedInToday] = useState(false)

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
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {firstName} 🌿
          </h1>
          <p className="text-sm text-slate-400 mt-1">
          {checkedInToday ? 'Check-in du jour complété ✓' : "Tu n'as pas encore fait ton check-in aujourd'hui."}
        </p>
        </div>

        {/* Check-in CTA */}
        <button
          onClick={() => navigate('/checkin')}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-navy-700 bg-navy-800 hover:bg-navy-700 transition-colors mb-5 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-periwinkle-500/15 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-periwinkle-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Comment te sens-tu maintenant ?</p>
            <p className="text-xs text-slate-500 mt-0.5">30 secondes · Protocole personnalisé ensuite</p>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Flame,    value: stats.streak,           label: 'Jours de suite' },
            { icon: Clock,    value: stats.total_this_month, label: 'Check-ins ce mois' },
            { icon: BookOpen, value: 0,                      label: 'Protocoles faits' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="stat-card">
              <Icon size={16} className="text-slate-500" />
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
              const height = dayData?.calm_avg ? (dayData.calm_avg / 10) : 0.05
              const hasData = dayData?.calm_avg !== null && dayData?.calm_avg !== undefined
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${hasData ? 'bg-periwinkle-500' : 'bg-navy-700'}`}
                    style={{ height: `${height * 100}%`, minHeight: '4px' }}
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
              <button key={p.title} className="text-left rounded-xl border border-navy-700 bg-navy-800 hover:bg-navy-700 p-4 transition-colors">
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
            <p className="text-sm font-semibold text-white">Journal du soir</p>
            <p className="text-xs text-slate-500">Écrire ce qui reste avant de dormir</p>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>

        {/* Recent activity */}
        <div>
          <p className="section-title mb-3">Activité récente</p>
          <div className="space-y-2">
            {stats.week.filter(d => d.calm_avg !== null).length === 0 ? (
              <p className="text-sm text-slate-500 italic px-1">Aucune activité pour l'instant. Fais ton premier check-in !</p>
            ) : (
              stats.week
                .filter(d => d.calm_avg !== null)
                .slice(0, 3)
                .map(d => (
                  <div key={d.date} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-navy-700 bg-navy-800">
                    <Clock size={14} className="text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">Check-in émotionnel complété</p>
                      <p className="text-xs text-slate-500">{new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
