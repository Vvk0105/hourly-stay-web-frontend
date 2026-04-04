import axiosInstance from './axiosInstance'

// Initiate payment — returns razorpay_key, razorpay_order_id, amount, currency
export const initiatePayment = (bookingId) =>
  axiosInstance.post('/api/v1/payment/payments/initiate/', { booking_id: bookingId })

// Verify payment after Razorpay callback
export const verifyPayment = (data) =>
  axiosInstance.post('/api/v1/payment/payments/verify/', data)

// Process refund (used after cancellation)
export const processRefund = (data) =>
  axiosInstance.post('/api/v1/payment/refunds/process/', data)
