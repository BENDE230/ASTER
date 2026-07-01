import { useState } from 'react'
import { Clock, Lock, HelpCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const CATEGORIES = ['Tous', 'Anti-rumination', 'Respiration', 'Retour au corps', 'Hypervigilance', 'Sommeil', 'Sécurité émotionnelle']

const TAG_COLORS: Record<string, string> = {
  'Anti-rumination':     'text-violet-400 bg-violet-400/10',
  'Respiration':         'text-blue-400 bg-blue-400/10',
  'Retour au corps':     'text-emerald-400 bg-emerald-400/10',
  'Hypervigilance':      'text-rose-400 bg-rose-400/10',
  'Sommeil':             'text-indigo-400 bg-indigo-400/10',
  'Sécurité émotionnelle': 'text-amber-400 bg-amber-400/10',
}

const PROTOCOLS = [
  { category: 'Anti-rumination', duration: '3 min',  title: 'Ancrage par les 5 sens',    description: 'Ramène ton attention au présent, concrètement.', premium: false },
  { category: 'Respiration',     duration: '5 min',  title: 'Cohérence cardiaque 4–6',   description: 'Régule ton système nerveux autonome.',           premium: false },
  { category: 'Retour au corps', duration: '7 min',  title: 'Scan corporel doux',         description: 'Parcours ton corps avec bienveillance.',         premium: false },
  { category: 'Hypervigilance',  duration: '4 min',  title: 'Protocole de sécurité',      description: 'Disponible en Premium.',                         premium: true  },
  { category: 'Sommeil',         duration: '10 min', title: 'Dépose mentale du soir',     description: 'Disponible en Premium.',                         premium: true  },
  { category: 'Sécurité émotionnelle', duration: '3 min', title: 'Auto-compassion rapide', description: 'Disponible en Premium.',                        premium: true  },
]

export default function Protocols() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filtered = activeCategory === 'Tous'
    ? PROTOCOLS
    : PROTOCOLS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-3xl">
        <p className="text-xs text-slate-500 mb-2 font-medium">Bibliothèque</p>
        <h1 className="text-3xl font-bold text-white mb-1">Protocoles de régulation.</h1>
        <p className="text-sm text-slate-400 mb-6">
          <strong className="text-white">3 protocoles</strong> disponibles ·{' '}
          <button className="text-periwinkle-400 hover:text-periwinkle-300 underline underline-offset-2 transition-colors">
            Débloquer les 6 en Premium
          </button>
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-navy-700 text-white border border-navy-500'
                  : 'text-slate-400 border border-navy-700 hover:text-white hover:bg-navy-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => (
            <div
              key={p.title}
              className={`rounded-xl border p-5 transition-colors ${
                p.premium
                  ? 'border-navy-700 bg-navy-800/50 opacity-60'
                  : 'border-navy-700 bg-navy-800 hover:bg-navy-700 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[p.category] ?? 'text-slate-400 bg-slate-400/10'} ${p.premium ? 'opacity-60' : ''}`}>
                  {p.category}
                </span>
                <div className="flex items-center gap-1.5">
                  {p.premium && <Lock size={11} className="text-amber-400" />}
                  {p.premium && <span className="text-xs text-amber-400 font-medium">Premium</span>}
                  <span className={`text-xs flex items-center gap-1 ${p.premium ? 'text-slate-600' : 'text-slate-500'}`}>
                    <Clock size={11} />{p.duration}
                  </span>
                </div>
              </div>
              <p className={`text-sm font-semibold mb-1 ${p.premium ? 'text-slate-500' : 'text-white'}`}>{p.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
