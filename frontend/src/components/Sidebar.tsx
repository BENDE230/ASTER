import { NavLink } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Home, CheckCircle, BookOpen, Shield, Sparkles, Moon, Zap, LogOut } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { usePremium } from '../hooks/usePremium'

const NAV = [
  { to: '/dashboard',  label: 'Accueil',    icon: Home },
  { to: '/checkin',    label: 'Check-in',   icon: CheckCircle },
  { to: '/journal',    label: 'Journal',    icon: BookOpen },
  { to: '/protocols',  label: 'Protocoles', icon: Shield },
  { to: '/insights',   label: 'Insights',   icon: Sparkles },
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

  const handleUpgrade = async () => {
    try {
      const data = await post<{ url: string }>('/api/stripe/create-checkout', {})
      if (data?.url) window.location.href = data.url
    } catch {
      alert('Erreur lors de la création du paiement.')
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[210px] flex flex-col border-r border-navy-700 bg-navy-900 z-30">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-periwinkle-500 flex items-center justify-center">
            <Moon size={14} className="text-white" />
          </div>
          <span className="font-semibold tracking-wide text-sm">ASTER</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-xs font-semibold text-slate-300">
          {initials}
        </div>
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
              onClick={handleUpgrade}
              className="w-full h-8 rounded-lg bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-xs font-semibold transition-colors"
            >
              Passer à Premium
            </button>
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
