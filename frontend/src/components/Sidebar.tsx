import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Home, CheckCircle, BookOpen, Shield, Sparkles, Moon, Zap, LogOut, X, UserCircle } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { usePremium } from '../hooks/usePremium'

const NAV = [
  { to: '/dashboard',  label: 'Accueil',    icon: Home },
  { to: '/checkin',    label: 'Check-in',   icon: CheckCircle },
  { to: '/journal',    label: 'Journal',    icon: BookOpen },
  { to: '/protocols',  label: 'Protocoles', icon: Shield },
  { to: '/insights',   label: 'Insights',   icon: Sparkles },
  { to: '/profile',    label: 'Profil',     icon: UserCircle },
]

interface SidebarProps {
  trialDaysLeft?: number
  isPremium?: boolean
}

export default function Sidebar({ trialDaysLeft = 5 }: SidebarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { post } = useApi()
  const isPremium = usePremium()
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'U'
  const [showPlans, setShowPlans] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    try {
      const data = await post<{ url: string }>(`/api/stripe/create-checkout?plan=${plan}`, {})
      if (data?.url) window.location.href = data.url
    } catch {
      alert('Erreur lors de la création du paiement.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[210px] flex-col border-r border-navy-700 bg-navy-900 z-30">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
            <Moon size={14} className="text-white" />
          </div>
          <span className="font-semibold tracking-wide text-sm">ASTER</span>
        </div>
        <NavLink to="/profile" className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-xs font-semibold text-slate-300 hover:bg-navy-600 transition-colors" title="Mon profil">
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            : initials
          }
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-periwinkle-500/15 text-periwinkle-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        {!isPremium && (
          <div className="rounded-xl border border-navy-600 bg-navy-800 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-300">Essai gratuit</p>
            <p className="text-xs text-slate-500">Il reste <span className="font-semibold text-white">{trialDaysLeft} jours</span></p>
            <button
              onClick={() => setShowPlans(true)}
              className="w-full h-8 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-xs font-semibold transition-colors"
            >
              Passer à Premium
            </button>
          </div>
        )}

        {/* Plans modal */}
        {showPlans && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 w-80 shadow-2xl relative">
              <button onClick={() => setShowPlans(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <h2 className="text-lg font-bold text-white mb-1">Passer à Premium</h2>
              <p className="text-xs text-slate-400 mb-5">Accès illimité à tous les outils ASTER</p>

              {/* Monthly */}
              <button
                onClick={() => handleUpgrade('monthly')}
                disabled={loading !== null}
                className="w-full rounded-xl border border-navy-600 bg-navy-800 hover:bg-navy-700 p-4 mb-3 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">Mensuel</span>
                  <span className="text-sm font-bold text-periwinkle-400">39 € / mois</span>
                </div>
                <p className="text-xs text-slate-500">Sans engagement · résiliable à tout moment</p>
                {loading === 'monthly' && <p className="text-xs text-periwinkle-400 mt-1">Chargement...</p>}
              </button>

              {/* Yearly */}
              <button
                onClick={() => handleUpgrade('yearly')}
                disabled={loading !== null}
                className="w-full rounded-xl border border-periwinkle-500/40 bg-periwinkle-500/10 hover:bg-periwinkle-500/20 p-4 text-left transition-colors relative"
              >
                <div className="absolute -top-2.5 left-4 bg-periwinkle-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Meilleure offre
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">Annuel</span>
                  <span className="text-sm font-bold text-periwinkle-400">299 € / an</span>
                </div>
                <p className="text-xs text-slate-400">Soit <strong className="text-white">24,90 € / mois</strong> · économisez 36 %</p>
                {loading === 'yearly' && <p className="text-xs text-periwinkle-400 mt-1">Chargement...</p>}
              </button>
            </div>
          </div>
        )}
        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors">
          <Zap size={13} />
          Aide-moi à redescendre
        </button>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          <LogOut size={13} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
