/**
 * Format a Date or ISO string for display
 */

export const formatDate = (date, options = {}) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatTime = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Calculate hours between two dates
 */
export const diffHours = (start, end) => {
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60) * 10) / 10)
}

/**
 * Calculate nights between two dates
 */
export const diffNights = (start, end) => {
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  return Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)))
}

/**
 * Format price in INR
 */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

/**
 * Returns a friendly duration label
 */
export const formatDuration = (hours) => {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours === 1) return '1 hour'
  return `${hours} hours`
}

/**
 * Convert local datetime to ISO string for API
 */
export const toIso = (date) => {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString()
}
