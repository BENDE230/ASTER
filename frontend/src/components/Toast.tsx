import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error   = useCallback((msg: string) => toast(msg, 'error'),   [toast])
  const info    = useCallback((msg: string) => toast(msg, 'info'),    [toast])

  const ICONS = {
    success: <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />,
    error:   <XCircle     size={15} className="text-red-400 flex-shrink-0" />,
    info:    <AlertCircle size={15} className="text-periwinkle-400 flex-shrink-0" />,
  }

  const BORDERS = {
    success: 'border-emerald-500/30',
    error:   'border-red-500/30',
    info:    'border-periwinkle-500/30',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-5 md:w-80 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-navy-900 shadow-lg pointer-events-auto animate-slide-in ${BORDERS[t.type]}`}
          >
            {ICONS[t.type]}
            <p className="text-sm text-slate-200 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
