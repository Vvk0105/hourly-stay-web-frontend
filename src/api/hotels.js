import axiosInstance from './axiosInstance'

export const getHotels = (params = {}) =>
  axiosInstance.get('/api/v1/property/public/hotels/home/', { params })

export const searchHotels = (params = {}) =>
  axiosInstance.get('/api/v1/property/public/hotels/search/', { params })

export const getHotelDetail = (id) =>
  axiosInstance.get(`/api/v1/property/public/hotels/${id}/`)

export const getHotelAvailability = (id, params = {}) =>
  axiosInstance.get(`/api/v1/property/public/hotels/${id}/availability/`, { params })

export const getHotelSlots = (id, params = {}) =>
  axiosInstance.get(`/api/v1/property/public/hotels/${id}/available-slots/`, { params })

export const checkPrice = (data) =>
  axiosInstance.post('/api/v1/property/public/bookings/price-check/', data)

export const getSearchSuggestions = (params = {}) =>
  axiosInstance.get('/api/v1/property/public/search/suggestions/', { params })
