import axiosInstance from './axiosInstance'

// Create a new booking (hourly or nightly)
export const createBooking = (data) =>
  axiosInstance.post('/api/v1/booking/bookings/create/', data)

// Get details of a specific booking
export const getBookingDetail = (bookingId) =>
  axiosInstance.get(`/api/v1/booking/bookings/${bookingId}/`)

// Get current user's booking list
export const getMyBookings = (params = {}) =>
  axiosInstance.get('/api/v1/booking/bookings/my-bookings/', { params })

// Get refund preview before cancellation
export const getRefundPreview = (bookingId) =>
  axiosInstance.get(`/api/v1/booking/bookings/${bookingId}/refund-preview/`)

// Cancel a booking
export const cancelBooking = (bookingId, reason = '') =>
  axiosInstance.post(`/api/v1/booking/bookings/${bookingId}/action/`, {
    action: 'CANCEL',
    reason,
  })

// Reviews
export const createReview = (data) =>
  axiosInstance.post('/api/v1/booking/reviews/', data)

export const getHotelReviews = (hotelId) =>
  axiosInstance.get(`/api/v1/booking/hotels/${hotelId}/reviews/`)
