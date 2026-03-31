import axiosInstance from './axiosInstance'

export const fetchWishlistHotelsAPI = async () => {
  const response = await axiosInstance.get('/api/v1/property/public/wishlist/')
  return response.data
}

export const toggleWishlistHotelAPI = async (hotelId) => {
  const response = await axiosInstance.post(`/api/v1/property/public/wishlist/${hotelId}/toggle/`)
  return response.data
}
