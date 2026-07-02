import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { LogOut, Crown, CreditCard, Calendar, ChevronRight, HelpCircle, User, Shield, ExternalLink } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApi } from '../hooks/useApi'

interface Subscription {
  is_premium: boolean
  plan: 'monthly' | 'yearly' | null
  ends_at: string | null
  customer_id: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Profile() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { get, post } = useApi()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loadingSub, setLoadingSub] = useState(true)
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await get<Subscription>('/api/stripe/subscription')
        setSub(data)
      } catch {
        setSub({ is_premium: false, plan: null, ends_at: null, customer_id: null })
      } finally {
        setLoadingSub(false)
      }
    }
    load()
  }, [])

  const handlePortal = async () => {
    setLoadingPortal(true)
    try {
      const data = await post<{ url: string }>('/api/stripe/portal', {})
      window.location.href = data.url
    } catch {
      alert("Impossible d'accéder au portail. Contacte le support.")
    } finally {
      setLoadingPortal(false)
    }
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U'

  const planLabel = sub?.plan === 'yearly' ? 'Annuel · 299 € / an' : 'Mensuel · 39 € / mois'

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <main className="ml-[210px] flex-1 px-8 py-8 max-w-xl">
        <p className="text-xs text-slate-500 mb-2 font-medium">Mon compte</p>
        <h1 className="text-3xl font-bold text-white mb-7">Profil</h1>

        {/* Avatar + infos */}
        <div className="rounded-xl border border-navy-700 bg-navy-800 px-5 py-5 mb-4 flex items-center gap-4">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-navy-600" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-periwinkle-500/20 border border-periwinkle-500/30 flex items-center justify-center text-xl font-bold text-periwinkle-400">
              {initials}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {sub?.is_premium ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  <Crown size={10} />
                  Premium
                </span>
              ) : (
                <span className="text-xs text-slate-500 bg-navy-700 px-2 py-0.5 rounded-full">
                  Essai gratuit
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Abonnement */}
        <div className="rounded-xl border border-navy-700 bg-navy-800 overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-navy-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Abonnement</p>
          </div>

          {loadingSub ? (
            <div className="px-5 py-4 space-y-2">
              <div className="h-4 bg-navy-700 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-navy-700 rounded animate-pulse w-1/3" />
            </div>
          ) : sub?.is_premium ? (
            <>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Shield size={14} className="text-amber-400" />
                    Plan actif
                  </div>
                  <span className="text-sm font-semibold text-white">{planLabel}</span>
                </div>
                {sub.ends_at && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar size={14} className="text-slate-500" />
                      Prochain renouvellement
                    </div>
                    <span className="text-sm text-slate-300">{formatDate(sub.ends_at)}</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-4">
                <button
                  onClick={handlePortal}
                  disabled={loadingPortal}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-navy-600 hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CreditCard size={14} />
                    {loadingPortal ? 'Ouverture...' : 'Gérer mon abonnement'}
                  </div>
                  <ExternalLink size={13} className="text-slate-500" />
                </button>
                <p className="text-xs text-slate-600 mt-2 text-center">
                  Modification, résiliation et historique de facturation via Stripe
                </p>
              </div>
            </>
          ) : (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <User size={14} />
                  Plan actif
                </div>
                <span className="text-sm text-slate-400">Essai gratuit</span>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Crown size={14} />
                  Passer à Premium
                </div>
                <ChevronRight size={14} className="text-white/70" />
              </button>
            </div>
          )}
        </div>

        {/* Compte */}
        <div className="rounded-xl border border-navy-700 bg-navy-800 overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-navy-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Compte</p>
          </div>
          <div className="px-5 py-3 space-y-1">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-400">Membre depuis</span>
              <span className="text-sm text-slate-300">
                {user?.createdAt ? formatDate(new Date(user.createdAt).toISOString()) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-400">Connexion via</span>
              <span className="text-sm text-slate-300">
                {user?.externalAccounts?.[0]?.provider === 'google' ? 'Google' : 'Email'}
              </span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-colors text-sm font-medium"
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </main>

      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
