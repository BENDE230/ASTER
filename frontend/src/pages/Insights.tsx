import { Lock, HelpCircle, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Sidebar from '../components/Sidebar'
import PremiumGate from '../components/PremiumGate'
import { usePremium } from '../hooks/usePremium'

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

export default function Insights() {
  const isPremium = usePremium()
  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-1">Tes patterns cette semaine.</h1>
        <p className="text-sm text-slate-500 mb-7">14 juin – 19 juin · 8 entrées analysées</p>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        <div className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-800 px-5 py-4">
          {!isPremium && <Lock size={14} className="text-amber-400 flex-shrink-0" />}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isPremium ? 'text-periwinkle-400' : 'text-amber-400'}`}>
              Note de la semaine {!isPremium && '· Premium'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isPremium
                ? 'Ta synthèse IA sera disponible chaque semaine selon tes entrées.'
                : "Une synthèse personnalisée de tes patterns, rédigée chaque semaine par l'IA — disponible en Premium."}
            </p>
          </div>
        </div>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
