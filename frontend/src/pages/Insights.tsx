import { useState, useEffect } from 'react'
import { Lock, TrendingUp, Sparkles, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Sidebar from '../components/Sidebar'
import PremiumGate from '../components/PremiumGate'
import { usePremium } from '../hooks/usePremium'
import { useApi } from '../hooks/useApi'

interface InsightsData {
  distribution: { name: string; value: number; count: number; color: string }[]
  week: { date: string; count: number; feeling: string | null }[]
  patterns: { label: string; desc: string; feeling: string; count: number; premium: boolean }[]
  total_30: number
  total_7: number
  has_data: boolean
}

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

function getWeekRange() {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

export default function Insights() {
  const isPremium = usePremium()
  const { get, post } = useApi()
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklyNote, setWeeklyNote] = useState('')
  const [loadingNote, setLoadingNote] = useState(false)

  useEffect(() => {
    get<InsightsData>('/api/insights')
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const generateWeeklyNote = async () => {
    if (!isPremium) return
    setLoadingNote(true)
    try {
      const entries = JSON.parse(localStorage.getItem('aster_journal') ?? '[]')
        .slice(0, 7)
        .map((e: { content: string }) => e.content)
      const result = await post<{ note: string }>('/api/ai/weekly-note', { entries })
      setWeeklyNote(result.note)
    } catch {
      setWeeklyNote("Impossible de générer la note. Réessaie dans un instant.")
    } finally {
      setLoadingNote(false)
    }
  }

  const hasData = data?.has_data ?? false

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-3xl pb-24 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Tes patterns cette semaine.</h1>
        <p className="text-sm text-slate-500 mb-2">{getWeekRange()}</p>
        {!loading && data && (
          <p className="text-xs text-slate-600 mb-6">
            {data.total_7} check-in{data.total_7 > 1 ? 's' : ''} cette semaine · {data.total_30} ce mois
          </p>
        )}
        {!loading && !data && (
          <p className="text-xs text-slate-600 mb-6">Données en cours de chargement...</p>
        )}

        {/* Charts row — always shown (empty state inside) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Donut chart — free */}
          <div className="rounded-xl border border-navy-700 bg-navy-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">États dominants · 30 jours</p>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-periwinkle-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : hasData && data?.distribution.length ? (
              <>
                <div className="flex justify-center mb-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={data.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {data.distribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#141728', border: '1px solid #232840', borderRadius: 8, fontSize: 12 }}
                        formatter={(val: number, _: string, props: { payload?: { count?: number } }) => [
                          `${val}% (${props?.payload?.count ?? 0} fois)`
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5">
                  {data.distribution.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-slate-400">{s.name}</span>
                      </div>
                      <span className="font-semibold text-white">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">📊</span>
                <p className="text-xs text-slate-500 text-center">Fais des check-ins pour voir<br />tes états dominants ici.</p>
              </div>
            )}
          </div>

          {/* Week chart — premium */}
          <div className="relative rounded-xl border border-navy-700 bg-navy-800 p-5 overflow-hidden">
            <p className={`text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 ${!isPremium ? 'opacity-30' : ''}`}>
              Présence · 7 jours
            </p>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-periwinkle-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className={`flex items-end gap-1.5 h-32 mb-2 ${!isPremium ? 'opacity-15' : ''}`}>
                {DAYS.map((day, i) => {
                  const d = data?.week[i]
                  const hasDone = d && d.count > 0
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1" title={d?.feeling ?? ''}>
                      <div
                        className={`w-full rounded-sm transition-all ${hasDone ? 'bg-periwinkle-500' : 'bg-navy-700'}`}
                        style={{ height: hasDone ? '100%' : '10%' }}
                      />
                      <span className="text-[10px] text-slate-600">{day}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {!isPremium && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <PremiumGate title="Graphique Premium" className="w-full" />
              </div>
            )}
          </div>
        </div>

        {/* Patterns */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Patterns détectés</p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-14 rounded-xl border border-navy-700 bg-navy-800 animate-pulse" />
              ))}
            </div>
          ) : hasData && data?.patterns.length ? (
            <div className="space-y-2">
              {data.patterns.map(p => {
                const locked = p.premium && !isPremium
                return (
                  <div key={p.label} className={`rounded-xl border border-navy-700 bg-navy-800 px-4 py-3.5 ${locked ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      {locked
                        ? <Lock size={13} className="text-amber-400 flex-shrink-0" />
                        : <CheckCircle size={13} className="text-periwinkle-400 flex-shrink-0" />
                      }
                      <p className={`text-sm font-semibold ${locked ? 'blur-sm select-none text-slate-300' : 'text-white'}`}>
                        {p.label}
                      </p>
                      {!locked && (
                        <span className="ml-auto text-xs text-slate-600">{p.count}x ce mois</span>
                      )}
                    </div>
                    <p className={`text-xs text-slate-500 leading-relaxed ml-5 ${locked ? 'blur-sm select-none' : ''}`}>
                      {p.desc}
                    </p>
                  </div>
                )
              })}
              {!isPremium && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-500/20 bg-navy-800 text-xs text-slate-400">
                  <Lock size={12} className="text-amber-400 flex-shrink-0" />
                  <span><strong className="text-amber-400">Patterns avancés · Premium</strong> — Détection automatique de tes tendances</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-navy-700 bg-navy-800/50 px-4 py-5 text-center">
              <p className="text-sm text-slate-500">Fais quelques check-ins pour voir tes patterns apparaître ici.</p>
            </div>
          )}
        </div>

        {/* Weekly AI note */}
        <div className="rounded-xl border border-navy-700 bg-navy-800 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {!isPremium && <Lock size={14} className="text-amber-400 flex-shrink-0" />}
              <p className={`text-xs font-semibold uppercase tracking-widest ${isPremium ? 'text-periwinkle-400' : 'text-amber-400'}`}>
                Note de la semaine {!isPremium && '· Premium'}
              </p>
            </div>
            {isPremium && !weeklyNote && (
              <button
                onClick={generateWeeklyNote}
                disabled={loadingNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-periwinkle-500/10 border border-periwinkle-500/30 text-periwinkle-400 text-xs font-medium hover:bg-periwinkle-500/20 transition-colors disabled:opacity-50"
              >
                {loadingNote ? (
                  <>
                    <div className="w-3 h-3 border-2 border-periwinkle-400/30 border-t-periwinkle-400 rounded-full animate-spin" />
                    Génération...
                  </>
                ) : (
                  <><Sparkles size={11} />Générer</>
                )}
              </button>
            )}
          </div>
          {weeklyNote ? (
            <p className="text-sm text-slate-300 leading-relaxed">{weeklyNote}</p>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              {isPremium
                ? "Clique sur Générer pour obtenir ta synthèse IA personnalisée de la semaine."
                : "Une synthèse personnalisée de tes patterns, rédigée chaque semaine par l'IA — disponible en Premium."}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
