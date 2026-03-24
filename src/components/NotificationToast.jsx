import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectToasts, removeToast } from '@/features/notifications/notificationsSlice'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 border-green-200',
    icon_color: 'text-green-600',
    text: 'text-green-800',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    icon_color: 'text-red-600',
    text: 'text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 border-yellow-200',
    icon_color: 'text-yellow-600',
    text: 'text-yellow-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    icon_color: 'text-blue-600',
    text: 'text-blue-800',
  },
}

const Toast = ({ toast }) => {
  const dispatch = useDispatch()
  const config = typeConfig[toast.type] ?? typeConfig.info
  const Icon = config.icon

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, dispatch])

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md',
        'animate-in slide-in-from-right-5 duration-300',
        config.bg,
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.icon_color)} />
      <p className={cn('text-sm font-medium flex-1', config.text)}>{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

const NotificationToast = () => {
  const toasts = useSelector(selectToasts)

  if (!toasts.length) return null

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default NotificationToast
