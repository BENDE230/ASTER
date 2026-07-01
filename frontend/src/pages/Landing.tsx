import { useNavigate } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { Moon, HelpCircle } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  const handleStart = () => {
    if (isSignedIn) {
      navigate('/dashboard')
    } else {
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 relative">
      {/* Soft glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-periwinkle-600/8 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs text-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-periwinkle-500 flex items-center justify-center">
            <Moon size={15} className="text-white" />
          </div>
          <span className="font-semibold tracking-widest text-sm text-slate-200">ASTER</span>
        </div>

        {/* Icon card */}
        <div className="w-20 h-20 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center">
          <Moon size={36} className="text-periwinkle-400" />
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold leading-tight text-white">
            Bienvenue dans<br />ton espace calme.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            ASTER t'accompagne quand ton mental s'emballe, quand tu ressens trop,
            quand tu as besoin de redescendre. Pas de jugement. Juste de la douceur.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full space-y-2">
          <button onClick={handleStart} className="btn-primary">
            Commencer mon espace
          </button>
          <p className="text-xs text-slate-500">5 jours gratuits · Sans carte bancaire</p>
        </div>

        {!isSignedIn && (
          <SignInButton mode="modal">
            <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Déjà un compte ? Se connecter
            </button>
          </SignInButton>
        )}
      </main>

      {/* Help */}
      <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
        <HelpCircle size={16} />
      </button>
    </div>
  )
}
