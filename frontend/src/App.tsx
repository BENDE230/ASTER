import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { lazy, Suspense } from 'react'
import { ToastProvider } from './components/Toast'
import BottomNav from './components/BottomNav'

const Landing    = lazy(() => import('./pages/Landing'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const SpaceReady = lazy(() => import('./pages/SpaceReady'))
const Dashboard  = lazy(() => import('./pages/Dashboard'))
const CheckIn    = lazy(() => import('./pages/CheckIn'))
const Journal    = lazy(() => import('./pages/Journal'))
const Protocols  = lazy(() => import('./pages/Protocols'))
const Insights   = lazy(() => import('./pages/Insights'))
const Profile    = lazy(() => import('./pages/Profile'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-periwinkle-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
