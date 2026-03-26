import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Star, Clock, Wifi, Tv, Wind, Car, Utensils, Waves, Moon } from 'lucide-react'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/wishlistSlice'
import { cn } from '@/utils/cn'

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
  return `${symbol}${Math.round(amount)}`
}

const HotelCard = ({ hotel }) => {
  const dispatch = useDispatch()
  const isWishlisted = useSelector(selectIsWishlisted(hotel.id))

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(hotel))
  }

  const { pricing, availability, location, images, average_rating } = hotel
  const currency = pricing?.currency ?? 'INR'
  const hourly = pricing?.hourly
  const daily = pricing?.daily
  const slots = pricing?.available_slots?.slots ?? []
  const minDuration = pricing?.available_slots?.min_duration_hours ?? hourly?.min_duration_hours

  const thumb = images?.thumbnail
    ? (images.thumbnail.startsWith('http') ? images.thumbnail : `${import.meta.env.VITE_API_BASE_URL ?? ''}${images.thumbnail}`)
    : images?.gallery?.[0]
      ? (images.gallery[0].startsWith('http') ? images.gallery[0] : `${import.meta.env.VITE_API_BASE_URL ?? ''}${images.gallery[0]}`)
      : `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop`

  const isAvailable = availability?.hourly?.is_available || availability?.nightly?.is_available

  return (
    <div className="hotel-card group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={thumb}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop` }}
        />

        {/* Availability badge */}
        <div className={cn(
          'absolute top-3 left-3 text-white px-2.5 py-1 rounded-full text-xs font-bold',
          isAvailable ? 'bg-green-500' : 'bg-gray-500'
        )}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>

        {/* Price badge */}
        {hourly && (
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-bold text-sm">
            {formatCurrency(hourly.starting_from, currency)} / {hourly.min_duration_hours}hr
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow transition-all hover:scale-110"
        >
          <Heart
            className={cn('w-4 h-4 transition-colors', isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{hotel.name}</h3>
          {average_rating > 0 && (
            <span className="rating-badge ml-2 flex-shrink-0 flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              {average_rating}
            </span>
          )}
        </div>

        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {location?.display_location ?? `${location?.city}, ${location?.state}`}
        </p>

        {/* Pricing row */}
        <div className="flex items-center gap-3 mb-3">
          {hourly && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-semibold text-brand-600 text-sm">
                {formatCurrency(hourly.starting_from, currency)}/{hourly.min_duration_hours}hr
              </span>
            </div>
          )}
          {daily && (
            <div className="flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500 text-sm">
                {formatCurrency(daily.starting_from, currency)}/night
              </span>
            </div>
          )}
        </div>

        {/* Slots preview */}
        {slots.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">Today's Slots</span>
              {minDuration && (
                <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  Min: {minDuration}hrs
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {slots.slice(0, 2).map((slot, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  <p className="text-xs font-semibold text-gray-800">
                    {formatTime(slot.start)} – {formatTime(slot.end)}
                  </p>
                  <p className="text-xs text-gray-400">{Math.floor(slot.duration_hours)} hrs</p>
                </div>
              ))}
              {slots.length > 2 && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 flex items-center">
                  <p className="text-xs text-gray-500">+{slots.length - 2} more</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book Now */}
        <Link
          to={`/hotels/${hotel.id}`}
          className="block w-full text-center py-2 rounded-xl border-2 border-brand-500 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default HotelCard
