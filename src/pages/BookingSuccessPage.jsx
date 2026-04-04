import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { getBookingDetail, getMyBookings } from '@/api/bookingApi'
import {
  CheckCircle, Hotel, Clock, Moon, Calendar, Users,
  Loader2, Download, Home, FileText, MapPin, AlertCircle
} from 'lucide-react'

const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '—'
  const symbols = { INR: '₹', USD: '$', AED: 'د.إ', GBP: '£', SGD: 'S$', AUD: 'A$' }
  const sym = symbols[currency] ?? currency + ' '
  return `${sym}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const formatDate = (str) => {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return str }
}

const statusColors = {
  CONFIRMED:       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  },
  PENDING_PAYMENT: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  CHECKED_IN:      { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  CHECKED_OUT:     { bg: 'bg-gray-50',   text: 'text-gray-700',   dot: 'bg-gray-400'   },
  CANCELLED:       { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'    },
}

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!bookingId) { setError('No booking ID found'); setLoading(false); return }

    // Strategy 1: Read from sessionStorage (set right after payment verification)
    try {
      const cached = sessionStorage.getItem(`booking_${bookingId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        setBooking(parsed)
        setLoading(false)
        return
      }
    } catch (_) {}

    // Strategy 2: Fetch from API — try bookings/:id/ first, fallback to my-bookings/
    const fetchBooking = async () => {
      try {
        const res = await getBookingDetail(bookingId)
        setBooking(res.data)
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          // Fallback: search in my-bookings list
          try {
            const listRes = await getMyBookings()
            const found = (listRes.data ?? []).find(b => String(b.id) === String(bookingId))
            if (found) {
              setBooking(found)
            } else {
              setError('Booking not found in your account')
            }
          } catch {
            setError('Could not load booking details. Please check My Bookings.')
          }
        } else {
          setError('Failed to load booking details')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  if (loading) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
        <p className="text-gray-500 font-medium">Loading your booking...</p>
      </div>
    </MainLayout>
  )

  // Even if we can't load details, show success + redirect links
  if (error || !booking) return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-500 mb-2">Your booking is confirmed.</p>
        {error && (
          <div className="inline-flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error} — check My Bookings for details.
          </div>
        )}
        <div className="flex gap-3 justify-center mt-4">
          <Link to="/" className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50">
            <Home className="inline w-4 h-4 mr-2" />Home
          </Link>
          <Link to="/bookings" className="px-5 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FileText className="inline w-4 h-4 mr-2" />My Bookings
          </Link>
        </div>
      </div>
    </MainLayout>
  )

  const statusStyle = statusColors[booking.status] ?? statusColors.CONFIRMED
  const isHourly = booking.booking_type === 'HOURLY'
  const currency = booking.payment_currency || 'INR'

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-gray-500">Your booking has been confirmed and payment received.</p>
        </div>

        {/* Booking Reference */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white text-center mb-6 shadow-lg">
          <p className="text-brand-200 text-sm font-medium mb-1">Booking Reference</p>
          <p className="text-3xl font-extrabold tracking-widest">{booking.booking_reference}</p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
            {booking.status?.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hotel className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-lg leading-tight">{booking.hotel_name}</h2>
              <p className="text-gray-500 text-sm">{booking.room_category || booking.room_type_name}</p>
              {booking.hotel_city && (
                <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{booking.hotel_city}
                </p>
              )}
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${isHourly ? 'bg-brand-50 text-brand-700' : 'bg-indigo-50 text-indigo-700'}`}>
              {isHourly ? '⏱ Hourly' : '🌙 Nightly'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />Check-in
              </p>
              <p className="font-bold text-gray-900 text-xs">{formatDate(booking.scheduled_check_in)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />Check-out
              </p>
              <p className="font-bold text-gray-900 text-xs">{formatDate(booking.scheduled_check_out)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />Guests
              </p>
              <p className="font-bold text-gray-900 text-xs">
                {booking.adults_count} adult{booking.adults_count !== 1 ? 's' : ''}
                {booking.children_count > 0 && ` + ${booking.children_count} child`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1">Rooms</p>
              <p className="font-bold text-gray-900 text-xs">{booking.rooms_count}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <h3 className="font-extrabold text-gray-900 text-base mb-4">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Base amount</span>
              <span>{formatCurrency(booking.base_amount, currency)}</span>
            </div>
            {parseFloat(booking.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−{formatCurrency(booking.discount_amount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Taxes & fees</span>
              <span>{formatCurrency(booking.tax_amount, currency)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-gray-900 text-lg pt-3 border-t border-gray-100 mt-2">
              <span>Total Paid</span>
              <span className="text-brand-700">{formatCurrency(booking.total_amount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Guest Info */}
        {(booking.guest_name || booking.guest_phone) && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <h3 className="font-extrabold text-gray-900 text-base mb-3">Guest Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {booking.guest_name && <p><span className="font-medium text-gray-900">Name:</span> {booking.guest_name}</p>}
              {booking.guest_phone && <p><span className="font-medium text-gray-900">Phone:</span> {booking.guest_phone}</p>}
              {booking.guest_email && <p><span className="font-medium text-gray-900">Email:</span> {booking.guest_email}</p>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
            <Home className="w-4 h-4" />Home
          </Link>
          <a href={`/api/v1/booking/bookings/${bookingId}/invoice/`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-brand-200 text-brand-700 font-bold text-sm hover:bg-brand-50 transition-colors">
            <Download className="w-4 h-4" />Invoice
          </a>
          <Link to="/bookings"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FileText className="w-4 h-4" />My Bookings
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}

export default BookingSuccessPage
