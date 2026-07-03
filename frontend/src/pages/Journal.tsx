import { useState, useEffect } from 'react'
import { Lock, Sparkles, BookOpen, Brain, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SkeletonEntry } from '../components/Skeleton'
import { useApi } from '../hooks/useApi'
import { usePremium } from '../hooks/usePremium'
import { useToast } from '../components/Toast'

interface AiAnalysis {
  emotion: string
  besoin: string
  reformulation: string
  exercice: string
}

interface Entry {
  id: number
  content: string
  created_at: string
  ai_analysis: AiAnalysis | null
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function EntryCard({
  entry,
  isPremium,
  onDelete,
  onAnalyzed,
}: {
  entry: Entry
  isPremium: boolean
  onDelete: (id: number) => void
  onAnalyzed: (id: number, analysis: AiAnalysis) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { post, patch, delete: del } = useApi()
  const toast = useToast()

  const handleAnalyze = async () => {
    if (!isPremium) return
    setAnalyzing(true)
    try {
      const result = await post<AiAnalysis>('/api/ai/analyze-journal', { content: entry.content })
      await patch(`/api/journal/${entry.id}/analysis`, { analysis: result })
      onAnalyzed(entry.id, result)
      toast.success('Analyse IA enregistrée ✓')
    } catch {
      toast.error("Analyse impossible. Réessaie dans un instant.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    try {
      await del(`/api/journal/${entry.id}`)
      onDelete(entry.id)
      toast.success('Entrée supprimée')
    } catch {
      toast.error("Impossible de supprimer l'entrée.")
    }
  }

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/60">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <BookOpen size={11} />
          {formatDate(entry.created_at)}
        </div>
        <div className="flex items-center gap-1">
          {isPremium && !entry.ai_analysis && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-periwinkle-400 hover:bg-periwinkle-500/10 transition-colors disabled:opacity-50"
            >
              {analyzing ? (
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <Sparkles size={11} />}
              Analyser
            </button>
          )}
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
              confirmDelete
                ? 'text-red-400 bg-red-400/10 font-medium'
                : 'text-slate-600 hover:text-red-400'
            }`}
          >
            <Trash2 size={12} />
            {confirmDelete && <span>Confirmer</span>}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 rounded text-slate-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className={`text-sm text-slate-300 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {entry.content}
        </p>
      </div>

      {/* AI Analysis */}
      {entry.ai_analysis && (
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-periwinkle-500/5 border border-periwinkle-500/20 px-3 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain size={12} className="text-periwinkle-400" />
              <span className="text-xs font-semibold text-periwinkle-400">Analyse IA</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-xs text-slate-600">Émotion</p>
                <p className="text-xs font-medium text-slate-300">{entry.ai_analysis.emotion}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Besoin</p>
                <p className="text-xs font-medium text-slate-300">{entry.ai_analysis.besoin}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic leading-relaxed">"{entry.ai_analysis.reformulation}"</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Journal() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [newEntryId, setNewEntryId] = useState<number | null>(null)

  // For new entry analysis
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const { get, post, patch } = useApi()
  const isPremium = usePremium()
  const toast = useToast()

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    const load = async () => {
      setLoadingEntries(true)
      try {
        const data = await get<{ entries: Entry[]; is_premium: boolean }>('/api/journal')
        setEntries(data.entries)
      } catch {
        // fallback: load from localStorage
        const local = JSON.parse(localStorage.getItem('aster_journal') ?? '[]')
        setEntries(local.map((e: { content: string; date: string }, i: number) => ({
          id: -(i + 1),
          content: e.content,
          created_at: e.date,
          ai_analysis: null,
        })))
      } finally {
        setLoadingEntries(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const result = await post<{ id: number; created_at: string }>('/api/journal', { content })
      const newEntry: Entry = { id: result.id, content, created_at: result.created_at, ai_analysis: null }
      setEntries(prev => [newEntry, ...prev])
      setNewEntryId(result.id)
      setContent('')
      setAnalysis(null)
      toast.success('Entrée enregistrée ✓')
    } catch {
      // fallback to localStorage
      const prev = JSON.parse(localStorage.getItem('aster_journal') ?? '[]')
      prev.unshift({ date: new Date().toISOString(), content })
      localStorage.setItem('aster_journal', JSON.stringify(prev.slice(0, 50)))
      setContent('')
      toast.info('Enregistré localement (hors ligne)')
    } finally {
      setSaving(false)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAnalyze = async () => {
    if (!content.trim() || !isPremium) return
    setAnalyzing(true)
    setAnalyzeError('')
    setAnalysis(null)
    try {
      const result = await post<AiAnalysis>('/api/ai/analyze-journal', { content })
      setAnalysis(result)
      toast.success('Analyse IA terminée ✓')
    } catch {
      setAnalyzeError("Une erreur s'est produite. Réessaie dans un instant.")
      toast.error("Analyse IA impossible. Réessaie dans un instant.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const handleAnalyzed = (id: number, a: AiAnalysis) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ai_analysis: a } : e))
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-2xl pb-24 md:pb-8">
        <p className="text-xs text-slate-500 mb-2 font-medium">Journal émotionnel</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Écris ce que tu ressens.</h1>
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
            onClick={handleAnalyze}
            disabled={!isPremium || !content.trim() || analyzing}
            className="flex items-center gap-2 px-4 h-10 rounded-lg border border-periwinkle-500/50 text-periwinkle-400 text-sm font-medium hover:bg-periwinkle-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analyse en cours...
              </>
            ) : (
              <>
                {isPremium ? <Sparkles size={13} /> : <Lock size={13} />}
                Analyser avec l'IA{!isPremium && ' · Premium'}
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="px-5 h-10 rounded-lg border border-navy-600 bg-navy-800 hover:bg-navy-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>

        {/* AI Analysis Result (before saving) */}
        {analysis && (
          <div className="rounded-xl border border-periwinkle-500/30 bg-periwinkle-500/5 px-5 py-4 mb-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={15} className="text-periwinkle-400" />
              <span className="text-sm font-semibold text-slate-200">Analyse de ton entrée</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-navy-800 px-3 py-2.5">
                <p className="text-xs text-slate-500 mb-0.5">Émotion détectée</p>
                <p className="text-sm font-medium text-slate-200">{analysis.emotion}</p>
              </div>
              <div className="rounded-lg bg-navy-800 px-3 py-2.5">
                <p className="text-xs text-slate-500 mb-0.5">Besoin sous-jacent</p>
                <p className="text-sm font-medium text-slate-200">{analysis.besoin}</p>
              </div>
            </div>
            <div className="rounded-lg bg-navy-800 px-3 py-2.5">
              <p className="text-xs text-slate-500 mb-1">Reformulation bienveillante</p>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{analysis.reformulation}"</p>
            </div>
            <div className="rounded-lg bg-navy-800 px-3 py-2.5">
              <p className="text-xs text-slate-500 mb-1">Exercice recommandé</p>
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.exercice}</p>
            </div>
          </div>
        )}

        {analyzeError && (
          <p className="text-sm text-red-400 mb-4">{analyzeError}</p>
        )}

        {/* Premium upsell */}
        {!isPremium && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-navy-800 px-5 py-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Analyse IA disponible en Premium</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Émotion dominante, besoin émotionnel, reformulation bienveillante et exercice recommandé.
                </p>
              </div>
            </div>
            <button className="ml-4 flex-shrink-0 px-3 py-1.5 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-xs font-semibold transition-colors">
              Débloquer
            </button>
          </div>
        )}

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">
              Entrées précédentes
              {!isPremium && (
                <span className="text-slate-600 normal-case tracking-normal font-normal ml-1">
                  (historique complet en Premium)
                </span>
              )}
            </p>
            {!loadingEntries && (
              <span className="text-xs text-slate-600">{entries.length} entrée{entries.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {loadingEntries ? (
            <div className="space-y-2">
              <SkeletonEntry />
              <SkeletonEntry />
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-navy-700 bg-navy-800/50 px-4 py-6 text-center">
              <BookOpen size={20} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucune entrée pour l'instant.</p>
              <p className="text-xs text-slate-600 mt-1">Écris ta première pensée ci-dessus.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  isPremium={isPremium}
                  onDelete={handleDelete}
                  onAnalyzed={handleAnalyzed}
                />
              ))}

              {!isPremium && entries.length >= 1 && (
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-navy-700 bg-navy-800/50 hover:bg-navy-800 transition-colors">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Lock size={12} />
                    Historique complet · Débloquer en Premium
                  </div>
                  <span className="text-slate-600 text-sm">›</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
