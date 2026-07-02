import { NavLink } from 'react-router-dom'
import { Home, CheckCircle, BookOpen, Shield, Sparkles, UserCircle } from 'lucide-react'

const NAV = [
  { to: '/dashboard',  label: 'Accueil',    icon: Home },
  { to: '/checkin',    label: 'Check-in',   icon: CheckCircle },
  { to: '/journal',    label: 'Journal',    icon: BookOpen },
  { to: '/protocols',  label: 'Protocoles', icon: Shield },
  { to: '/insights',   label: 'Insights',   icon: Sparkles },
  { to: '/profile',    label: 'Profil',     icon: UserCircle },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-navy-900 border-t border-navy-700 flex items-center justify-around px-1 pb-safe">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-3 text-[10px] font-medium transition-colors ${
              isActive ? 'text-periwinkle-400' : 'text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
