import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import SpaceReady from './pages/SpaceReady'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import Journal from './pages/Journal'
import Protocols from './pages/Protocols'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

const PROTECTED_PATHS = ['/dashboard', '/checkin', '/journal', '/protocols', '/insights', '/profile']

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div className="min-h-screen bg-navy-950 flex items-center justify-center"><div className="w-6 h-6 border-2 border-periwinkle-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout() {
  const location = useLocation()
  const showBottomNav = PROTECTED_PATHS.some(p => location.pathname.startsWith(p))

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/space-ready" element={<SpaceReady />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/protocols" element={<ProtectedRoute><Protocols /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  )
}
