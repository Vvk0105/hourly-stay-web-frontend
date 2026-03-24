import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { addToast, removeToast } from '@/features/notifications/notificationsSlice'

/**
 * Hook to dispatch toast notifications.
 * Usage: const notify = useNotify()
 *        notify.success('Booking confirmed!')
 *        notify.error('Something went wrong.')
 *        notify.info('Searching hotels...')
 *        notify.warning('Date in the past!')
 */
export const useNotify = () => {
  const dispatch = useDispatch()

  const notify = useCallback(
    (message, type = 'info', duration = 4000) => {
      const action = dispatch(addToast({ message, type, duration }))
      const id = action.payload?.id

      if (id && duration > 0) {
        setTimeout(() => {
          dispatch(removeToast(id))
        }, duration)
      }
    },
    [dispatch],
  )

  return {
    success: (msg, dur) => notify(msg, 'success', dur),
    error:   (msg, dur) => notify(msg, 'error', dur),
    warning: (msg, dur) => notify(msg, 'warning', dur),
    info:    (msg, dur) => notify(msg, 'info', dur),
  }
}
