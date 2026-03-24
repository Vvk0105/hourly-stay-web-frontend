import MainLayout from '@/layouts/MainLayout'
import HotelCard from '@/components/HotelCard'
import { useSelector } from 'react-redux'
import { selectWishlistHotels } from '@/features/wishlist/wishlistSlice'
import { Heart } from 'lucide-react'

const WishlistPage = () => {
  const hotels = useSelector(selectWishlistHotels)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-500 mb-8">Hotels you've saved for later</p>

        {hotels.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-center text-gray-400">
              <Heart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No saved hotels yet</p>
              <p className="text-sm mt-1">Tap the ♥ on any hotel card to save it here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default WishlistPage
