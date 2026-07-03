import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ToastProvider } from './components/Toast'
import BottomNav from './components/BottomNav'
import ProtectedLayout from './components/ProtectedLayout'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import SpaceReady from './pages/SpaceReady'

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
        <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
          <Route path="/dashboard" />
          <Route path="/checkin" />
          <Route path="/journal" />
          <Route path="/protocols" />
          <Route path="/insights" />
          <Route path="/profile" />
        </Route>
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
