import { useState } from 'react'
import { Lock, TrendingUp, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Sidebar from '../components/Sidebar'
import PremiumGate from '../components/PremiumGate'
import { usePremium } from '../hooks/usePremium'
import { useApi } from '../hooks/useApi'

const DOMINANT_STATES = [
  { name: 'Rumination',       value: 38, color: '#9b9ff5' },
  { name: 'Fatigue',          value: 27, color: '#94a3b8' },
  { name: 'Surcharge sociale',value: 20, color: '#c4b5fd' },
  { name: 'Hypercontrôle',    value: 15, color: '#e2e8f0' },
]

const PATTERNS = [
  { label: 'Rumination fréquente', description: 'Tu présentes des cycles de pensées récurrentes, surtout en soirée.' },
  { label: 'Fatigue de régulation', description: null, premium: true },
  { label: 'Surcharge sociale', description: null, premium: true },
]

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
  const { post } = useApi()
  const [weeklyNote, setWeeklyNote] = useState('')
  const [loadingNote, setLoadingNote] = useState(false)

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

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-3xl pb-24 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Tes patterns cette semaine.</h1>
        <p className="text-sm text-slate-500 mb-7">{getWeekRange()}</p>

        {/* Charts row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Donut chart — free */}
          <div className="rounded-xl border border-navy-700 bg-navy-800 p-5">
            <p className="section-title mb-4">États dominants</p>
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={DOMINANT_STATES}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {DOMINANT_STATES.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#141728', border: '1px solid #232840', borderRadius: 8, fontSize: 12 }}
                    formatter={(val: number) => [`${val}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {DOMINANT_STATES.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-400">{s.name}</span>
                  </div>
                  <span className="font-semibold text-white">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line chart — premium */}
          <div className="relative rounded-xl border border-navy-700 bg-navy-800 p-5 overflow-hidden">
            <p className={`section-title mb-4 ${isPremium ? '' : 'opacity-30'}`}>Calme perçu · 7 jours</p>
            <div className={`h-40 flex items-end gap-1 mb-2 ${isPremium ? 'opacity-100' : 'opacity-15'}`}>
              {[4,6,5,7,5,8,6].map((v, i) => (
                <div key={i} className="flex-1 bg-periwinkle-500 rounded-sm" style={{ height: `${v * 12}%` }} />
              ))}
            </div>
            {!isPremium && (
              <>
                <TrendingUp size={20} className="text-slate-600 absolute top-16 left-1/2 -translate-x-1/2 opacity-30" />
                <PremiumGate title="Graphique Premium" className="absolute inset-4" />
              </>
            )}
          </div>
        </div>

        {/* Patterns */}
        <div className="mb-5">
          <p className="section-title mb-3">Patterns détectés</p>
          <div className="space-y-2">
            {PATTERNS.map(p => (
              <div key={p.label} className={`rounded-xl border border-navy-700 bg-navy-800 px-4 py-3.5 ${p.premium && !isPremium ? 'opacity-50 relative overflow-hidden' : ''}`}>
                <p className={`text-sm font-semibold mb-0.5 ${p.premium && !isPremium ? 'blur-sm select-none text-slate-300' : 'text-white'}`}>{p.label}</p>
                {p.description && (
                  <p className="text-xs text-slate-500">{p.description}</p>
                )}
                {p.premium && !isPremium && (
                  <p className="text-xs blur-sm select-none text-slate-500">Détection automatique de tes tendances comportementales sur la semaine.</p>
                )}
                {p.premium && isPremium && (
                  <p className="text-xs text-slate-500">Détection automatique de tes tendances comportementales sur la semaine.</p>
                )}
              </div>
            ))}
          </div>

          {/* Patterns premium overlay */}
          {!isPremium && (
            <div className="mt-2 flex items-center justify-between px-4 py-3 rounded-xl border border-amber-500/20 bg-navy-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock size={12} className="text-amber-400" />
                <span><strong className="text-amber-400">Patterns avancés · Premium</strong> — Détection automatique de tes tendances</span>
              </div>
            </div>
          )}
        </div>

        {/* Weekly note — premium */}
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
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles size={11} />
                    Générer
                  </>
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
