import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { getMyBookings, getRefundPreview, cancelBooking, createReview } from '@/api/bookingApi'
import {
  Clock, Moon, Calendar, Hotel, MapPin, ChevronDown, ChevronUp,
  Loader2, FileText, AlertCircle, CheckCircle, XCircle, X,
  Download, RefreshCw, Star
} from 'lucide-react'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const formatCurrency = (amount, currency = 'INR') => {
  if (amount == null) return '—'
  const symbols = { INR: '₹', USD: '$', AED: 'د.إ', GBP: '£', SGD: 'S$', AUD: 'A$' }
  const sym = symbols[currency] ?? currency + ' '
  return `${sym}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const formatDate = (str) => {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return str }
}

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: 'Pending Payment', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CONFIRMED:       { label: 'Confirmed',       icon: CheckCircle, bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  CHECKED_IN:      { label: 'Checked In',      icon: CheckCircle, bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  CHECKED_OUT:     { label: 'Checked Out',     icon: CheckCircle, bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200'   },
  CANCELLED:       { label: 'Cancelled',       icon: XCircle,     bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  FAILED:          { label: 'Failed',          icon: AlertCircle, bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
}

// ──── Refund Preview Modal ────────────────────────────────────────
const RefundPreviewModal = ({ booking, onClose, onCancel }) => {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRefundPreview(booking.id)
        setPreview(res.data)
      } catch {
        toast.error('Could not load refund preview')
        onClose()
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [booking.id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelBooking(booking.id, reason)
      toast.success('Booking cancelled')
      onCancel()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel booking'
      toast.error(msg)
    } finally {
      setCancelling(false)
    }
  }

  const currency = booking.payment_currency || 'INR'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">Cancel Booking</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : preview && (
            <>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <p className="font-bold text-amber-800 mb-1 text-sm">Refund Information</p>
                <p className="text-amber-700 text-sm">{preview.refund_label}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total paid</span>
                  <span>{formatCurrency(preview.total_amount, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Refund amount</span>
                  <span className={parseFloat(preview.refund_amount) > 0 ? 'text-green-700' : 'text-red-500'}>
                    {formatCurrency(preview.refund_amount, currency)}
                  </span>
                </div>
                {preview.refund_percentage != null && (
                  <div className="flex justify-between text-gray-500">
                    <span>Refund percentage</span>
                    <span>{preview.refund_percentage}%</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Why are you cancelling?"
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                  Keep Booking
                </button>
                <button onClick={handleCancel} disabled={cancelling}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ──── Review Modal ────────────────────────────────────────
const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) { toast.error('Please enter a comment'); return }
    setSubmitting(true)
    try {
      await createReview({
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
      })
      toast.success('Review submitted successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">Leave a Review</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(r => (
              <button key={r} onClick={() => setRating(r)}
                className="focus:outline-none transition-transform hover:scale-110">
                <Star className={cn("w-8 h-8", r <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="How was your stay?"
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 resize-none"
            />
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ──── Single Booking Card ─────────────────────────────────────────
const BookingCard = ({ booking, onRefresh }) => {
  const [expanded, setExpanded] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.CONFIRMED
  const StatusIcon = status.icon
  const isHourly = booking.booking_type === 'HOURLY'
  const currency = booking.payment_currency || 'INR'
  const canCancel = ['CONFIRMED', 'PENDING_PAYMENT'].includes(booking.status)

  return (
    <>
      {showRefundModal && (
        <RefundPreviewModal
          booking={booking}
          onClose={() => setShowRefundModal(false)}
          onCancel={onRefresh}
        />
      )}
      {showReviewModal && (
        <ReviewModal
          booking={booking}
          onClose={() => setShowReviewModal(false)}
          onSuccess={onRefresh}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        {/* Card Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Hotel className="w-5 h-5 text-brand-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-gray-900 truncate">{booking.hotel_name}</h3>
                <p className="text-gray-500 text-sm">{booking.room_category || booking.room_type_name}</p>
                <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{booking.hotel_city}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isHourly ? 'bg-brand-50 text-brand-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {isHourly ? '⏱ Hourly' : '🌙 Nightly'}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium mb-0.5">Check-in</p>
              <p className="font-semibold text-gray-800 text-xs">{formatDate(booking.scheduled_check_in)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium mb-0.5">Check-out</p>
              <p className="font-semibold text-gray-800 text-xs">{formatDate(booking.scheduled_check_out)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">Ref: <span className="font-bold text-gray-700">{booking.booking_reference}</span></p>
              <p className="text-lg font-extrabold text-brand-700 mt-0.5">
                {formatCurrency(booking.total_amount, currency)}
              </p>
            </div>
            <button onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors">
              {expanded ? <><ChevronUp className="w-4 h-4" />Less</> : <><ChevronDown className="w-4 h-4" />Details</>}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base amount</span><span>{formatCurrency(booking.base_amount, currency)}</span>
              </div>
              {parseFloat(booking.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>−{formatCurrency(booking.discount_amount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span><span>{formatCurrency(booking.tax_amount, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                <span>Total</span><span>{formatCurrency(booking.total_amount, currency)}</span>
              </div>
            </div>

            {/* Refund info (if cancelled) */}
            {booking.refund_request && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-sm">
                <p className="font-bold text-green-800 mb-1">Refund Status</p>
                <p className="text-green-700">Amount: {formatCurrency(booking.refund_request.refund_amount, currency)}</p>
                <p className="text-green-600 text-xs mt-0.5">Status: {booking.refund_request.status}</p>
              </div>
            )}

            {/* Review info */}
            {booking.review && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-sm">
                <p className="font-bold text-amber-800 mb-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />Your Review
                </p>
                <p className="text-amber-700">{booking.review.comment}</p>
                <p className="text-xs text-amber-500 mt-0.5">Rating: {booking.review.rating}/5</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <a href={`/api/v1/booking/bookings/${booking.id}/invoice/`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" />Invoice
              </a>
              {canCancel && (
                <button onClick={() => setShowRefundModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />Cancel Booking
                </button>
              )}
              {booking.status === 'CHECKED_OUT' && !booking.review && (
                <button onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 text-amber-600 text-xs font-semibold hover:bg-amber-50 transition-colors">
                  <Star className="w-3.5 h-3.5" />Leave Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ──── Main Page ───────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Upcoming', value: 'CONFIRMED' },
  { label: 'Active', value: 'CHECKED_IN' },
  { label: 'Completed', value: 'CHECKED_OUT' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (activeTab) params.status = activeTab
      const res = await getMyBookings(params)
      setBookings(res.data ?? [])
    } catch (err) {
      setError('Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [activeTab, refreshKey])

  const handleRefresh = () => setRefreshKey(k => k + 1)

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">Your past and upcoming stays</p>
          </div>
          <button onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                activeTab === tab.value
                  ? 'text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:border-brand-300 bg-white'
              )}
              style={activeTab === tab.value ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
            <p className="text-gray-500 font-medium">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
            <p className="font-semibold text-red-400">{error}</p>
            <button onClick={fetchBookings} className="mt-4 px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold">
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <FileText className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-semibold text-lg">No bookings found</p>
            <p className="text-sm mt-1">
              {activeTab ? `No ${activeTab.toLowerCase()} bookings` : "You haven't made any bookings yet"}
            </p>
            <Link to="/hotels" className="mt-5 px-6 py-2.5 text-white rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              Browse Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} onRefresh={handleRefresh} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default MyBookingsPage
