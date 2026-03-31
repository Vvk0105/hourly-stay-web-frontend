import MainLayout from '@/layouts/MainLayout'
import HotelCard from '@/components/HotelCard'
import { useDispatch, useSelector } from 'react-redux'
import { selectWishlistHotels, selectWishlistStatus, fetchWishlist } from '@/features/wishlist/wishlistSlice'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { Heart, Loader } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const WishlistPage = () => {
  const dispatch = useDispatch()
  const hotels = useSelector(selectWishlistHotels)
  const status = useSelector(selectWishlistStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist())
    }
  }, [isAuthenticated, dispatch])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-500 mb-8">Hotels you've saved for later</p>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <Heart className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">You are not signed in</h3>
            <p className="text-gray-500 mt-2 mb-6">Sign in to save and view your favorite hotels</p>
            <Link to="/login" className="bg-brand-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-700 transition">
              Sign In
            </Link>
          </div>
        ) : status === 'loading' ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
            <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
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
