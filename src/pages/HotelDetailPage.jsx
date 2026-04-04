import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import MainLayout from '@/layouts/MainLayout'
import { getHotelDetail, checkPrice } from '@/api/hotels'
import { getHotelReviews } from '@/api/bookingApi'
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice'
import { selectUserCurrency } from '@/features/search/searchSlice'
import {
  MapPin, Star, Clock, Moon, Users, ChevronLeft, ChevronRight,
  Wifi, Tv, Wind, Car, Utensils, Waves, Shield, ArrowLeft,
  Loader2, CalendarDays, Info, CheckCircle, X, CreditCard,
  Heart, AlertCircle
} from 'lucide-react'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const amenityIconMap = {
  WIFI: Wifi, WiFi: Wifi, TV: Tv, AC: Wind,
  Parking: Car, Restaurant: Utensils, Pool: Waves,
}

const formatTime = (isoStr) => {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '—'
  const symbols = { INR: '₹', USD: '$', AED: 'د.إ', GBP: '£', SGD: 'S$', AUD: 'A$' }
  const sym = symbols[currency] ?? currency + ' '
  return `${sym}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const SlotSection = ({ slotsData }) => {
  if (!slotsData?.slots?.length) return null
  const { slots, min_duration_hours } = slotsData
  return (
    <div className="bg-blue-50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-blue-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="font-bold text-blue-700 text-sm">Hourly Stay Time Slots</span>
        </div>
        {min_duration_hours && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            Min: {min_duration_hours}hrs
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot, i) => (
          <div key={i} className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-blue-100 min-w-[130px]">
            <p className="text-sm font-bold text-gray-800">{formatTime(slot.start)} – {formatTime(slot.end)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{Math.floor(slot.duration_hours)} hrs</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────── BOOKING MODAL ───────────────────────────────
const BookingModal = ({ hotel, roomTypes, currency, onClose }) => {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [step, setStep] = useState(1) // 1=type, 2=dates, 3=guests, 4=price check
  const [bookingType, setBookingType] = useState('HOURLY')
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes?.[0] || null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [priceResult, setPriceResult] = useState(null)
  const [calculating, setCalculating] = useState(false)

  const minDateTime = new Date().toISOString().slice(0, 16)

  const hourlyRoomTypes = roomTypes?.filter(r => r.pricing?.hourly?.is_enabled) ?? []
  const nightlyRoomTypes = roomTypes ?? []
  const availableRooms = bookingType === 'HOURLY' ? hourlyRoomTypes : nightlyRoomTypes

  useEffect(() => {
    if (availableRooms.length > 0 && !availableRooms.find(r => r.id === selectedRoomType?.id)) {
      setSelectedRoomType(availableRooms[0])
    }
  }, [bookingType])

  const handlePriceCheck = async () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out times')
      return
    }
    setCalculating(true)
    try {
      const payload = {
        hotel_id: hotel.id,
        room_type_id: selectedRoomType.id,
        booking_type: bookingType,
        check_in: checkIn,
        check_out: checkOut,
        rooms_count: rooms,
        adults_count: adults,
        children_count: children,
        user_currency: currency,
      }
      const res = await checkPrice(payload)
      setPriceResult(res.data)
      setStep(4)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Failed to calculate price'
      toast.error(msg)
    } finally {
      setCalculating(false)
    }
  }

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book')
      navigate('/login')
      return
    }
    const params = new URLSearchParams({
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      room_type_id: selectedRoomType.id,
      room_type_name: selectedRoomType.name,
      booking_type: bookingType,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      rooms,
      currency,
      base_amount: priceResult.base_amount,
      tax_amount: priceResult.tax_amount,
      discount_amount: priceResult.discount_amount ?? 0,
      total_amount: priceResult.total_amount,
    })
    navigate(`/booking/breakdown?${params.toString()}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Book Your Stay</h2>
            <p className="text-sm text-gray-500 mt-0.5">{hotel.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Booking Type */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stay Type</p>
            <div className="grid grid-cols-2 gap-3">
              {['HOURLY', 'NIGHTLY'].map(type => (
                <button key={type}
                  onClick={() => setBookingType(type)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-2xl border-2 transition-all font-semibold text-sm',
                    bookingType === type
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}>
                  {type === 'HOURLY' ? <Clock className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {type === 'HOURLY' ? 'Hourly' : 'Nightly'}
                </button>
              ))}
            </div>
          </div>

          {/* Room Type */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Room Type</p>
            {availableRooms.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                No {bookingType.toLowerCase()} rooms available for this hotel.
              </div>
            ) : (
              <select
                value={selectedRoomType?.id ?? ''}
                onChange={e => setSelectedRoomType(availableRooms.find(r => r.id === parseInt(e.target.value)))}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-brand-400 bg-white"
              >
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {bookingType === 'HOURLY'
                      ? formatCurrency(r.pricing?.hourly?.base_price, currency) + '/hr'
                      : formatCurrency(r.pricing?.nightly?.base_price, currency) + '/night'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {bookingType === 'HOURLY' ? 'Check-in Time' : 'Check-in Date'}
              </p>
              <input
                type={bookingType === 'HOURLY' ? 'datetime-local' : 'date'}
                value={checkIn}
                min={minDateTime}
                onChange={e => { setCheckIn(e.target.value); setPriceResult(null); setStep(Math.min(step, 3)) }}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {bookingType === 'HOURLY' ? 'Check-out Time' : 'Check-out Date'}
              </p>
              <input
                type={bookingType === 'HOURLY' ? 'datetime-local' : 'date'}
                value={checkOut}
                min={checkIn || minDateTime}
                onChange={e => { setCheckOut(e.target.value); setPriceResult(null); setStep(Math.min(step, 3)) }}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Rooms', value: rooms, set: setRooms, min: 1, max: 10 },
              { label: 'Adults', value: adults, set: setAdults, min: 1, max: 10 },
              { label: 'Children', value: children, set: setChildren, min: 0, max: 10 },
            ].map(({ label, value, set, min, max }) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-2">
                  <button onClick={() => set(v => Math.max(min, v - 1))}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-gray-600">
                    −
                  </button>
                  <span className="flex-1 text-center font-semibold text-sm">{value}</span>
                  <button onClick={() => set(v => Math.min(max, v + 1))}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-gray-600">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price Result */}
          {priceResult && step === 4 && (
            <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-2xl p-4 border border-brand-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Price Breakdown</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Base amount</span>
                  <span>{formatCurrency(priceResult.base_amount, priceResult.currency || currency)}</span>
                </div>
                {priceResult.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−{formatCurrency(priceResult.discount_amount, priceResult.currency || currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & fees</span>
                  <span>{formatCurrency(priceResult.tax_amount, priceResult.currency || currency)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-gray-900 text-base pt-2 border-t border-brand-200 mt-2">
                  <span>Total</span>
                  <span className="text-brand-700">{formatCurrency(priceResult.total_amount, priceResult.currency || currency)}</span>
                </div>
                {priceResult.converted_total && (
                  <p className="text-xs text-gray-400 text-right">
                    ≈ {formatCurrency(priceResult.converted_total, priceResult.converted_currency)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {step < 4 || !priceResult ? (
              <button
                onClick={handlePriceCheck}
                disabled={calculating || !checkIn || !checkOut || availableRooms.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {calculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {calculating ? 'Calculating...' : 'Check Price'}
              </button>
            ) : (
              <>
                <button onClick={() => { setPriceResult(null); setStep(3) }}
                  className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button
                  onClick={handleProceed}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base transition-all"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <CreditCard className="w-5 h-5" />
                  Confirm & Book
                </button>
              </>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">Instant confirmation · No hidden fees</p>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────── ROOM TYPE CARD ──────────────────────────────
const RoomTypeCard = ({ room, currency, onBook }) => {
  const hourly = room.pricing?.hourly
  const nightly = room.pricing?.nightly
  return (
    <div className="border border-gray-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900">{room.name}</h4>
          {room.description && <p className="text-gray-500 text-sm mt-0.5">{room.description}</p>}
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-100 px-2.5 py-1.5 rounded-lg">
          <Users className="w-3.5 h-3.5" />
          <span>{room.capacity?.max_adults} adults</span>
          {room.capacity?.max_children > 0 && <span>+ {room.capacity.max_children} child</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        {hourly?.is_enabled && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Hourly</p>
              <p className="text-sm font-bold text-brand-600">
                {formatCurrency(hourly.base_price, currency)}
                <span className="text-gray-400 font-normal text-xs"> / {hourly.min_duration_hours}hr</span>
              </p>
            </div>
          </div>
        )}
        {nightly?.base_price && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Nightly</p>
              <p className="text-sm font-bold text-indigo-600">
                {formatCurrency(nightly.base_price, currency)}
                <span className="text-gray-400 font-normal text-xs"> / night</span>
              </p>
            </div>
          </div>
        )}
      </div>
      {room.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {room.amenities.map(a => {
            const Icon = amenityIconMap[a.icon?.toUpperCase()] ?? amenityIconMap[a.name] ?? null
            return (
              <span key={a.id} className="amenity-tag flex items-center gap-1 text-xs">
                {Icon && <Icon className="w-3 h-3" />}
                {a.name}
              </span>
            )
          })}
        </div>
      )}
      {room.available_slots?.slots?.length > 0 && <SlotSection slotsData={room.available_slots} />}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">{room.capacity?.total_inventory} room{room.capacity?.total_inventory !== 1 ? 's' : ''} available</p>
        <button onClick={() => onBook(room)}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors">
          Book This Room
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────── MAIN PAGE ───────────────────────────────────
const HotelDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const userCurrency = useSelector(selectUserCurrency)

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [preselectedRoom, setPreselectedRoom] = useState(null)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const [res, reviewsRes] = await Promise.all([
          getHotelDetail(id),
          getHotelReviews(id).catch(() => ({ data: [] }))
        ])
        setHotel(res.data)
        setReviews(reviewsRes.data?.results || reviewsRes.data || [])
      } catch (err) {
        console.error('Hotel detail fetch error:', err)
        setError('Failed to load hotel details.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
        <p className="font-medium">Loading hotel details...</p>
      </div>
    </MainLayout>
  )

  if (error || !hotel) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <p className="text-red-400 font-medium">{error ?? 'Hotel not found'}</p>
        <button onClick={() => navigate('/hotels')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          Back to Hotels
        </button>
      </div>
    </MainLayout>
  )

  const { pricing, availability, location, operations, policies, room_types, images, average_rating, total_reviews } = hotel
  const currency = pricing?.currency || userCurrency || 'INR'
  const allImages = images?.length ? images : []
  const currentImage = allImages[imgIndex]?.large ?? allImages[imgIndex]?.image
    ?? `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=700&fit=crop`

  const handleBookRoom = (room) => {
    setPreselectedRoom(room)
    setShowBookingModal(true)
  }

  return (
    <MainLayout>
      {showBookingModal && (
        <BookingModal
          hotel={hotel}
          roomTypes={room_types}
          currency={currency}
          onClose={() => { setShowBookingModal(false); setPreselectedRoom(null) }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/hotels" className="flex items-center gap-1 hover:text-brand-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />All Hotels
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">{hotel.name}</span>
        </div>

        {/* Photo Gallery */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 mb-6 bg-gray-100">
          <img src={currentImage} alt={hotel.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=700&fit=crop` }} />
          {allImages.length > 1 && (
            <>
              <button onClick={() => setImgIndex(i => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setImgIndex(i => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={cn('w-2 h-2 rounded-full transition-all', imgIndex === i ? 'bg-white scale-125' : 'bg-white/50')} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{hotel.name}</h1>
                  <p className="text-gray-500 flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {location?.display_location ?? `${location?.city}, ${location?.state}`}
                    {location?.address && `, ${location.address}`}
                  </p>
                </div>
                {average_rating > 0 && (
                  <div className="flex flex-col items-center bg-brand-600 text-white rounded-2xl px-4 py-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-white" />
                      <span className="text-xl font-extrabold">{average_rating}</span>
                    </div>
                    <p className="text-xs text-brand-100">{total_reviews} reviews</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {availability?.hourly?.is_available && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />Hourly Available
                  </span>
                )}
                {availability?.nightly?.is_available && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />Nightly Available
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {hotel.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">About the Property</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{hotel.description}</p>
              </div>
            )}

            {/* Pricing Summary */}
            {pricing && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Pricing</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  {pricing.hourly && (
                    <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                      <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Hourly Stay</p>
                        <p className="font-bold text-brand-700 text-lg">
                          {formatCurrency(pricing.hourly.starting_from, currency)}
                          <span className="text-sm text-gray-500 font-normal"> / {pricing.hourly.min_duration_hours} hrs</span>
                        </p>
                      </div>
                    </div>
                  )}
                  {pricing.daily && (
                    <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Moon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Nightly Stay</p>
                        <p className="font-bold text-indigo-700 text-lg">
                          {formatCurrency(pricing.daily.starting_from, currency)}
                          <span className="text-sm text-gray-500 font-normal"> / night</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {pricing.available_slots?.slots?.length > 0 && <SlotSection slotsData={pricing.available_slots} />}
              </div>
            )}

            {/* Room Types */}
            {room_types?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Room Types
                  <span className="ml-2 text-sm font-normal text-gray-500">({room_types.length} available)</span>
                </h2>
                <div className="space-y-4">
                  {room_types.map(room => (
                    <RoomTypeCard key={room.id} room={room} currency={currency} onBook={handleBookRoom} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-brand-500 fill-brand-500" />
                  Guest Reviews
                  <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {reviews.map((rev, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{rev.user_name || 'Guest'}</span>
                          <span className="text-xs text-gray-400">{}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-amber-600 font-bold text-xs ring-1 ring-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {rev.rating}/5
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Check-in/out */}
            {operations && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-brand-500" />Check-in / Check-out
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-semibold text-gray-800">{operations.check_in_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-semibold text-gray-800">{operations.check_out_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Timezone</span>
                    <span className="font-semibold text-gray-800 text-xs">{operations.timezone}</span>
                  </div>
                  {operations.is_hourly_enabled && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />Hourly stays available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {policies?.refund && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />Cancellation Policy
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Full refund if cancelled {policies.refund.full_refund_window_hours}+ hrs before</span>
                  </div>
                  <div className="flex items-start gap-2 text-amber-700">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{policies.refund.partial_refund_percentage}% refund {policies.refund.no_refund_window_hours}–{policies.refund.full_refund_window_hours} hrs before</span>
                  </div>
                  <div className="flex items-start gap-2 text-red-600">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>No refund within {policies.refund.no_refund_window_hours} hrs of check-in</span>
                  </div>
                </div>
              </div>
            )}

            {/* Book CTA */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 text-white">
              <p className="text-sm font-medium text-brand-100 mb-1">Starting from</p>
              <p className="text-3xl font-extrabold mb-4">
                {pricing?.hourly
                  ? formatCurrency(pricing.hourly.starting_from, currency)
                  : pricing?.daily
                    ? formatCurrency(pricing.daily.starting_from, currency)
                    : 'Contact us'}
                <span className="text-lg font-normal text-brand-200 ml-1">
                  {pricing?.hourly ? `/ ${pricing.hourly.min_duration_hours}hr` : '/ night'}
                </span>
              </p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="block w-full text-center bg-white text-brand-700 font-bold py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-md"
              >
                Book Now
              </button>
              <p className="text-center text-xs text-brand-200 mt-3">Instant confirmation • No hidden fees</p>
            </div>

            {/* Location */}
            {(location?.latitude && location?.longitude) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />Location
                </h3>
                <p className="text-sm text-gray-600">{location.display_location}</p>
                {location.address && <p className="text-sm text-gray-500">{location.address}</p>}
                <a href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-brand-600 font-semibold hover:underline">
                  View on Google Maps →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default HotelDetailPage
