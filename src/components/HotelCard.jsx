import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Star, Wifi, Tv, Wind, Car, Utensils, Waves } from 'lucide-react'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/wishlistSlice'
import { setBookingHotel } from '@/features/booking/bookingSlice'
import { cn } from '@/utils/cn'

const amenityIconMap = {
  WiFi: Wifi,
  TV: Tv,
  AC: Wind,
  Parking: Car,
  Restaurant: Utensils,
  Pool: Waves,
}

const HotelCard = ({ hotel }) => {
  const dispatch = useDispatch()
  const isWishlisted = useSelector(selectIsWishlisted(hotel.id))

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(hotel))
  }

  const handleBook = (e) => {
    e.preventDefault()
    dispatch(setBookingHotel(hotel))
  }

  return (
    <div className="hotel-card group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={hotel.image || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop`}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Price badge */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-bold text-sm">
          {hotel.price_display ?? `₹${hotel.price} / 3hr`}
        </div>

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
          {hotel.rating > 0 && (
            <span className="rating-badge ml-2 flex-shrink-0 flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              {hotel.rating}
            </span>
          )}
        </div>

        <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {hotel.location}
        </p>

        {/* Price row */}
        <div className="mb-3">
          <span className="font-semibold text-brand-600">{hotel.price_display ?? `₹${hotel.price} / 3hr`}</span>
          {hotel.extra_price_display && (
            <span className="text-gray-400 text-xs ml-1">{hotel.extra_price_display}</span>
          )}
        </div>

        {/* Amenities */}
        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hotel.amenities.slice(0, 3).map((amenity) => {
              const Icon = amenityIconMap[amenity] ?? null
              return (
                <span key={amenity} className="amenity-tag flex items-center gap-1">
                  {Icon && <Icon className="w-3 h-3" />}
                  {amenity}
                </span>
              )
            })}
          </div>
        )}

        {/* Book Now */}
        <Link
          to={`/hotels/${hotel.id}`}
          onClick={handleBook}
          className="block w-full text-center py-2 rounded-xl border-2 border-brand-500 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors"
        >
          Book Now →
        </Link>
      </div>
    </div>
  )
}

export default HotelCard
