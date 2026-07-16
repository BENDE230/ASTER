import { useEffect, useState, type FormEvent } from 'react'
import { Star, Send } from 'lucide-react'
import { API_URL } from '../lib/api'

export interface ReviewItem {
  id: number
  author_name: string
  rating: number
  comment: string
  created_at: string | null
}

interface ReviewSectionProps {
  /** Prefill author name (e.g. from Clerk) */
  defaultName?: string
  /** Compact layout for Profile page */
  compact?: boolean
}

function Stars({
  value,
  onChange,
  size = 16,
}: {
  value: number
  onChange?: (n: number) => void
  size?: number
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ defaultName = '', compact = false }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [name, setName] = useState(defaultName)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (defaultName) setName(defaultName)
  }, [defaultName])

  useEffect(() => {
    fetch(`${API_URL}/api/reviews`)
      .then(r => r.json())
      .then((data: ReviewItem[]) => {
        if (Array.isArray(data)) setReviews(data)
      })
      .catch(() => {})
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 1) {
      setError('Indique ton prénom.')
      return
    }
    if (comment.trim().length < 10) {
      setError('Écris au moins quelques mots (10 caractères min.).')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: name.trim(),
          rating,
          comment: comment.trim(),
        }),
      })
      if (!res.ok) throw new Error('fail')
      const created: ReviewItem = await res.json()
      setReviews(prev => [created, ...prev])
      setComment('')
      setRating(5)
      setDone(true)
    } catch {
      setError("Impossible d'envoyer l'avis. Réessaie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-8'}>
      {!compact && reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reviews.slice(0, 6).map(r => (
            <div key={r.id} className="rounded-xl border border-navy-700 bg-navy-800 px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">{r.author_name}</p>
                <Stars value={r.rating} size={13} />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}

      {compact && reviews.length > 0 && (
        <div className="space-y-2">
          {reviews.slice(0, 3).map(r => (
            <div key={r.id} className="rounded-lg border border-navy-700 bg-navy-900/50 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-300">{r.author_name}</p>
                <Stars value={r.rating} size={11} />
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}

      {done ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-emerald-400">Merci pour ton avis !</p>
          <p className="text-xs text-slate-400 mt-1">Il apparaît déjà sur la page d'accueil.</p>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="mt-3 text-xs text-periwinkle-400 hover:text-periwinkle-300"
          >
            Écrire un autre avis
          </button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className={`rounded-xl border border-navy-700 bg-navy-800 ${compact ? 'px-4 py-4' : 'px-5 py-5'} space-y-3`}
        >
          {!compact && (
            <p className="text-sm font-semibold text-white">Ton expérience compte</p>
          )}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Prénom</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={60}
              placeholder="Alex"
              className="w-full rounded-lg bg-navy-900 border border-navy-600 focus:border-periwinkle-500 focus:outline-none px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Note</label>
            <Stars value={rating} onChange={setRating} size={compact ? 18 : 22} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Ton avis</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={800}
              rows={compact ? 3 : 4}
              placeholder="Ce qui t'a aidé, ce que tu recommanderais…"
              className="w-full rounded-lg bg-navy-900 border border-navy-600 focus:border-periwinkle-500 focus:outline-none px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            <Send size={14} />
            {loading ? 'Envoi…' : 'Publier mon avis'}
          </button>
        </form>
      )}
    </div>
  )
}
