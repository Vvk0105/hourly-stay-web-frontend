import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { getHotelDetail } from '@/api/hotels'
import {
  MapPin, Star, Clock, Moon, Users, ChevronLeft, ChevronRight,
  Wifi, Tv, Wind, Car, Utensils, Waves, Shield, ArrowLeft,
  Loader2, CalendarDays, Info, CheckCircle
} from 'lucide-react'
import { cn } from '@/utils/cn'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const amenityIconMap = {
  WIFI: Wifi, WiFi: Wifi,
  TV: Tv,
  AC: Wind,
  Parking: Car,
  Restaurant: Utensils,
  Pool: Waves,
}

const formatTime = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatCurrency = (amount, currency = 'INR') => {
  const symbol = currency === 'USD' ? '$' : '₹'
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`
}

// Slot UI matching the screenshot
const SlotSection = ({ slotsData, currency }) => {
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
          <div
            key={i}
            className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-blue-100 min-w-[130px]"
          >
            <p className="text-sm font-bold text-gray-800">
              {formatTime(slot.start)} – {formatTime(slot.end)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{Math.floor(slot.duration_hours)} hrs</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Room type card
const RoomTypeCard = ({ room, currency }) => {
  const hourly = room.pricing?.hourly
  const nightly = room.pricing?.nightly
  const isHourlyEnabled = hourly?.is_enabled

  return (
    <div className="border border-gray-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition-all">
      {/* Room name & capacity */}
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

      {/* Pricing */}
      <div className="flex flex-wrap gap-4 mb-4">
        {hourly && isHourlyEnabled && (
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
              {hourly.price_per_extra_hour && (
                <p className="text-xs text-amber-600 font-medium">
                  +{formatCurrency(hourly.price_per_extra_hour, currency)}/extra hr
                </p>
              )}
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

      {/* Amenities */}
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

      {/* Slots for this room type */}
      {room.available_slots?.slots?.length > 0 && (
        <SlotSection slotsData={room.available_slots} currency={currency} />
      )}

      {/* Inventory */}
      <p className="text-xs text-gray-400 mt-3">
        {room.capacity?.total_inventory} room{room.capacity?.total_inventory !== 1 ? 's' : ''} available
      </p>
    </div>
  )
}

const HotelDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getHotelDetail(id)
        setHotel(res.data)
      } catch (err) {
        console.error('Hotel detail fetch error:', err)
        setError('Failed to load hotel details.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
          <p className="font-medium">Loading hotel details...</p>
        </div>
      </MainLayout>
    )
  }

  if (error || !hotel) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <p className="text-red-400 font-medium">{error ?? 'Hotel not found'}</p>
          <button
            onClick={() => navigate('/hotels')}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            Back to Hotels
          </button>
        </div>
      </MainLayout>
    )
  }

  const { pricing, availability, location, operations, policies, room_types, images, average_rating, total_reviews } = hotel
  const currency = room_types?.[0]?.pricing?.hourly?.base_price ? 'INR' : 'INR'
  const allImages = images?.length ? images : []
  const currentImage = allImages[imgIndex]?.large ?? allImages[imgIndex]?.image ?? `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=700&fit=crop`
  const currencyCode = pricing?.hourly ? 'INR' : 'INR'

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/hotels" className="flex items-center gap-1 hover:text-brand-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            All Hotels
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">{hotel.name}</span>
        </div>

        {/* Photo Gallery */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 mb-6 bg-gray-100">
          <img
            src={currentImage}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=700&fit=crop` }}
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex(i => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setImgIndex(i => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={cn('w-2 h-2 rounded-full transition-all', imgIndex === i ? 'bg-white scale-125' : 'bg-white/50')}
                  />
                ))}
              </div>
            </>
          )}
          {/* No images fallback overlay */}
          {allImages.length === 0 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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

              {/* Availability Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {availability?.hourly?.is_available && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Hourly Available ({availability.hourly.available_rooms} rooms)
                  </span>
                )}
                {availability?.nightly?.is_available && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Nightly Available ({availability.nightly.available_rooms} rooms)
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

            {/* Hotel-level Pricing Summary */}
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
                          {formatCurrency(pricing.hourly.starting_from)}
                          <span className="text-sm text-gray-500 font-normal"> / {pricing.hourly.min_duration_hours} hrs</span>
                        </p>
                        {pricing.hourly.price_per_extra_hour && (
                          <p className="text-xs text-amber-600 font-semibold">
                            +{formatCurrency(pricing.hourly.price_per_extra_hour)}/extra hr
                          </p>
                        )}
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
                          {formatCurrency(pricing.daily.starting_from)}
                          <span className="text-sm text-gray-500 font-normal"> / night</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hotel-level available slots */}
                {pricing.available_slots?.slots?.length > 0 && (
                  <SlotSection slotsData={pricing.available_slots} />
                )}
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
                    <RoomTypeCard key={room.id} room={room} currency={pricing?.currency} />
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
                  <CalendarDays className="w-4 h-4 text-brand-500" />
                  Check-in / Check-out
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
                      <Clock className="w-3.5 h-3.5" />
                      Hourly stays available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Policy */}
            {policies?.refund && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Cancellation Policy
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Full refund if cancelled {policies.refund.full_refund_window_hours}+ hrs before</span>
                  </div>
                  <div className="flex items-start gap-2 text-amber-700">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{policies.refund.partial_refund_percentage}% refund if {policies.refund.no_refund_window_hours}–{policies.refund.full_refund_window_hours} hrs before</span>
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
                  ? formatCurrency(pricing.hourly.starting_from)
                  : pricing?.daily
                    ? formatCurrency(pricing.daily.starting_from)
                    : 'Contact us'}
                <span className="text-lg font-normal text-brand-200 ml-1">
                  {pricing?.hourly ? `/ ${pricing.hourly.min_duration_hours}hr` : '/ night'}
                </span>
              </p>
              <Link
                to={`/booking?hotel_id=${hotel.id}`}
                className="block w-full text-center bg-white text-brand-700 font-bold py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-md"
              >
                Book Now
              </Link>
              <p className="text-center text-xs text-brand-200 mt-3">
                Instant confirmation • No hidden fees
              </p>
            </div>

            {/* Location */}
            {(location?.latitude && location?.longitude) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Location
                </h3>
                <p className="text-sm text-gray-600">{location.display_location}</p>
                {location.address && <p className="text-sm text-gray-500">{location.address}</p>}
                <a
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-brand-600 font-semibold hover:underline"
                >
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
