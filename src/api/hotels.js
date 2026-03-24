import axiosInstance from './axiosInstance'

// Public hotel list — pass search params
export const getHotels = (params = {}) =>
  axiosInstance.get('/api/properties/hotels/', { params })

// Single hotel detail
export const getHotelDetail = (id) =>
  axiosInstance.get(`/api/properties/hotels/${id}/`)

// Hotel rooms for a property
export const getHotelRooms = (hotelId, params = {}) =>
  axiosInstance.get(`/api/properties/hotels/${hotelId}/rooms/`, { params })

// Room detail
export const getRoomDetail = (hotelId, roomId) =>
  axiosInstance.get(`/api/properties/hotels/${hotelId}/rooms/${roomId}/`)

// Check availability
export const checkAvailability = (params) =>
  axiosInstance.post('/api/properties/check-availability/', params)
