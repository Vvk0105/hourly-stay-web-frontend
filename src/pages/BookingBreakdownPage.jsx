import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MainLayout from '@/layouts/MainLayout'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { createBooking } from '@/api/bookingApi'
import { initiatePayment, verifyPayment } from '@/api/paymentApi'
import {
  ArrowLeft, Hotel, Clock, Moon, Users, CreditCard,
  Loader2, CheckCircle, AlertCircle, User, Phone, Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '—'
  const symbols = { INR: '₹', USD: '$', AED: 'د.إ', GBP: '£', SGD: 'S$', AUD: 'A$' }
  const sym = symbols[currency] ?? currency + ' '
  return `${sym}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const formatDateDisplay = (str, isHourly) => {
  if (!str) return '—'
  try {
    const d = new Date(str)
    if (isHourly) return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    return d.toLocaleDateString('en-IN', { dateStyle: 'medium' })
  } catch { return str }
}

// Load Razorpay checkout.js dynamically
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const BookingBreakdownPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)

  // Parse params from URL (set by HotelDetailPage booking modal)
  const hotelId = parseInt(searchParams.get('hotel_id'))
  const hotelName = searchParams.get('hotel_name') || 'Hotel'
  const roomTypeId = parseInt(searchParams.get('room_type_id'))
  const roomTypeName = searchParams.get('room_type_name') || 'Room'
  const bookingType = searchParams.get('booking_type') || 'HOURLY'
  const checkIn = searchParams.get('check_in') || ''
  const checkOut = searchParams.get('check_out') || ''
  const adults = parseInt(searchParams.get('adults') || '1')
  const children = parseInt(searchParams.get('children') || '0')
  const rooms = parseInt(searchParams.get('rooms') || '1')
  const currency = searchParams.get('currency') || 'INR'
  const baseAmount = parseFloat(searchParams.get('base_amount') || '0')
  const taxAmount = parseFloat(searchParams.get('tax_amount') || '0')
  const discountAmount = parseFloat(searchParams.get('discount_amount') || '0')
  const totalAmount = parseFloat(searchParams.get('total_amount') || '0')

  const isHourly = bookingType === 'HOURLY'

  // Guest details form — pre-fill from user profile
  const [guestName, setGuestName] = useState(user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '')
  const [guestEmail, setGuestEmail] = useState(user?.email || '')
  const [guestPhone, setGuestPhone] = useState(user?.phone || '')
  const [bookingStatus, setBookingStatus] = useState('idle') // idle | creating | paying | error
  const [errorMsg, setErrorMsg] = useState('')

  if (!hotelId || !roomTypeId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
          <p className="font-semibold text-lg">Invalid booking data</p>
          <Link to="/hotels" className="mt-4 px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold">
            Back to Hotels
          </Link>
        </div>
      </MainLayout>
    )
  }

  const handleConfirmBooking = async () => {
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error('Name and phone number are required')
      return
    }

    setBookingStatus('creating')
    setErrorMsg('')

    try {
      // Step 1: Create booking
      const bookingPayload = {
        hotel_id: hotelId,
        room_type_id: roomTypeId,
        booking_type: bookingType,
        rooms_count: rooms,
        adults_count: adults,
        children_count: children,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        guest_phone: guestPhone.trim(),
      }
      // Pass user UUID so booking is linked to the account
      if (user?.id) bookingPayload.user_uuid = user.id

      if (isHourly) {
        bookingPayload.check_in = checkIn
        bookingPayload.check_out = checkOut
      } else {
        bookingPayload.check_in_date = checkIn
        bookingPayload.check_out_date = checkOut
      }

      const bookingRes = await createBooking(bookingPayload)
      const booking = bookingRes.data
      const bookingId = booking.id

      // Step 2: Load Razorpay SDK
      setBookingStatus('paying')
      const razorLoaded = await loadRazorpay()
      if (!razorLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.')
        setBookingStatus('error')
        setErrorMsg('Could not load Razorpay SDK.')
        return
      }

      // Step 3: Initiate payment order
      const payRes = await initiatePayment(bookingId)
      const { razorpay_key, razorpay_order_id, amount, currency: payCurrency, booking_reference } = payRes.data

      // Step 4: Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const options = {
          key: razorpay_key,
          amount,
          currency: payCurrency || 'INR',
          name: 'HourlyStay',
          description: `Booking: ${booking_reference}`,
          order_id: razorpay_order_id,
          prefill: {
            name: guestName,
            email: guestEmail,
            contact: guestPhone,
          },
          theme: { color: '#667eea' },
          handler: async (response) => {
            try {
              // Step 5: Verify payment — backend confirms booking
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              // Cache booking details in sessionStorage to avoid 403 on success page
              try {
                sessionStorage.setItem(`booking_${bookingId}`, JSON.stringify({
                  ...booking,
                  status: 'CONFIRMED',
                  booking_reference,
                  base_amount: baseAmount,
                  tax_amount: taxAmount,
                  discount_amount: discountAmount,
                  total_amount: totalAmount,
                  hotel_name: hotelName,
                  room_type_name: roomTypeName,
                  booking_type: bookingType,
                  scheduled_check_in: checkIn,
                  scheduled_check_out: checkOut,
                  adults_count: adults,
                  children_count: children,
                  rooms_count: rooms,
                  guest_name: guestName,
                  guest_email: guestEmail,
                  guest_phone: guestPhone,
                  payment_currency: currency,
                }))
              } catch (_) {}

              resolve()
              navigate(`/booking/success?booking_id=${bookingId}`)
            } catch (err) {
              reject(new Error(err.response?.data?.error || 'Payment verification failed'))
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          reject(new Error(response.error?.description || 'Payment failed'))
        })
        rzp.open()
      })

    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.non_field_errors?.[0]
        || err.message
        || 'Something went wrong. Please try again.'

      if (msg !== 'Payment cancelled') {
        toast.error(msg)
        setErrorMsg(msg)
        setBookingStatus('error')
      } else {
        toast('Payment cancelled')
        setBookingStatus('idle')
      }
    }
  }

  const isProcessing = bookingStatus === 'creating' || bookingStatus === 'paying'

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-brand-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Booking Breakdown</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Confirm Your Booking</h1>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hotel className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-lg">{hotelName}</h2>
              <p className="text-gray-500 text-sm">{roomTypeName}</p>
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${isHourly ? 'bg-brand-50 text-brand-700' : 'bg-indigo-50 text-indigo-700'}`}>
              {isHourly ? '⏱ Hourly' : '🌙 Nightly'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-5">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1">Check-in</p>
              <p className="font-bold text-gray-900">{formatDateDisplay(checkIn, isHourly)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1">Check-out</p>
              <p className="font-bold text-gray-900">{formatDateDisplay(checkOut, isHourly)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1">Guests</p>
              <p className="font-bold text-gray-900">
                {adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? ` + ${children} child` : ''}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-medium uppercase mb-1">Rooms</p>
              <p className="font-bold text-gray-900">{rooms}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Base amount</span>
              <span>{formatCurrency(baseAmount, currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>−{formatCurrency(discountAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes & fees</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-gray-900 text-xl pt-3 border-t border-gray-200 mt-2">
              <span>Total Payable</span>
              <span className="text-brand-700">{formatCurrency(totalAmount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Guest Details Form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <h3 className="font-extrabold text-gray-900 text-lg mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />Guest Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Email (optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handleConfirmBooking}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-extrabold text-lg disabled:opacity-60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {bookingStatus === 'creating' ? 'Creating Booking...' : 'Opening Payment...'}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay {formatCurrency(totalAmount, currency)}
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 mt-4">
          <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-5 opacity-60"
            onError={e => e.target.style.display = 'none'} />
          <p className="text-xs text-gray-400">Secured by Razorpay · 256-bit SSL</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default BookingBreakdownPage
