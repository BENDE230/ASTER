import { useState, useEffect } from 'react'
import { Lock, HelpCircle, Sparkles, BookOpen } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApi } from '../hooks/useApi'

interface Entry {
  date: string
  content: string
}

const SAMPLE_ENTRIES: Entry[] = [
  {
    date: 'Hier · 22h03',
    content: "Je me suis senti·e submergé·e lors de la réunion. Trop de bruit, trop de demandes simultanées...",
  },
]

export default function Journal() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { post } = useApi()
  const isPremium = false

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      await post('/api/journal', { content })
    } catch {
      const prev = JSON.parse(localStorage.getItem('aster_journal') ?? '[]')
      prev.unshift({ date: new Date().toISOString(), content })
      localStorage.setItem('aster_journal', JSON.stringify(prev.slice(0, 50)))
    } finally {
      setSaving(false)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-2xl">
        <p className="text-xs text-slate-500 mb-2 font-medium">Journal émotionnel</p>
        <h1 className="text-3xl font-bold text-white mb-1">Écris ce que tu ressens.</h1>
        <p className="text-sm text-slate-400 mb-7">Sans filtre, sans jugement. C'est ton espace.</p>

        {/* Textarea */}
        <div className="rounded-xl border border-navy-700 bg-navy-800 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-navy-700">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <BookOpen size={12} />
              {today}
            </div>
            <span className="text-xs text-slate-600">{content.length} car.</span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Ce que je vis en ce moment..."
            className="w-full h-48 bg-transparent px-4 py-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-5">
          <button
            disabled={!isPremium}
            className="flex items-center gap-2 px-4 h-10 rounded-lg border border-periwinkle-500/50 text-periwinkle-400 text-sm font-medium hover:bg-periwinkle-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock size={13} />
            Analyser avec l'IA · Premium
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="px-5 h-10 rounded-lg border border-navy-600 bg-navy-800 hover:bg-navy-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>

        {/* Premium AI card */}
        {!isPremium && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-navy-800 px-5 py-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Analyse IA disponible en Premium</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Détection de l'émotion dominante, du besoin émotionnel, reformulation bienveillante
                  et exercice recommandé — à partir de 1€.
                </p>
              </div>
            </div>
            <button className="ml-4 flex-shrink-0 px-3 py-1.5 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-xs font-semibold transition-colors">
              Débloquer
            </button>
          </div>
        )}

        {/* Previous entries */}
        <div>
          <p className="section-title mb-3">
            Entrées précédentes{' '}
            <span className="text-slate-600 normal-case tracking-normal font-normal">
              (historique complet en Premium)
            </span>
          </p>
          <div className="space-y-2">
            {SAMPLE_ENTRIES.map((entry, i) => (
              <div key={i} className="rounded-xl border border-navy-700 bg-navy-800 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <BookOpen size={11} />
                  {entry.date}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{entry.content}</p>
              </div>
            ))}

            {/* Locked */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-navy-700 bg-navy-800/50 hover:bg-navy-800 transition-colors">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock size={12} />
                2 entrées supplémentaires · Débloquer l'historique complet
              </div>
              <span className="text-slate-600 text-sm">›</span>
            </button>
          </div>
        </div>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
