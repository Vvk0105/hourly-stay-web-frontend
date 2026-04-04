import axiosInstance from './axiosInstance'

export const getHotels = (params = {}) =>
  axiosInstance.get('/api/v1/property/public/hotels/home/', { params })

// POST with flat JSON body — lat, lng, radius_km, booking_type, check_in, check_out, rooms, adults, children
export const searchHotels = (data = {}) =>
  axiosInstance.post('/api/v1/property/public/hotels/search/', data)

export const getHotelDetail = (id, params = {}) =>
  axiosInstance.get(`/api/v1/property/public/hotels/${id}/`, { params })

export const getHotelAvailability = (id, params = {}) =>
  axiosInstance.get(`/api/v1/property/public/hotels/${id}/availability/`, { params })

export const getHotelSlots = (id, params = {}) =>
  axiosInstance.get(`/api/v1/property/public/hotels/${id}/available-slots/`, { params })

export const checkPrice = (data) =>
  axiosInstance.post('/api/v1/property/public/bookings/price-check/', data)

export const getSearchSuggestions = (query) =>
  axiosInstance.get('/api/v1/property/public/search/suggestions/', { params: { query } })

// Detect user location from IP => { country_code, currency, latitude, longitude, city, state }
export const detectLocation = () =>
  axiosInstance.get('/api/v1/property/public/detect-location/')
