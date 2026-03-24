import axiosInstance from './axiosInstance'

// Send OTP to phone number
export const sendOtp = (phone) =>
  axiosInstance.post('/api/auth/users/send-otp/', { phone })

// Verify OTP — returns { access, refresh, user }
export const verifyOtp = (phone, otp) =>
  axiosInstance.post('/api/auth/users/verify-otp/', { phone, otp })

// Refresh JWT access token
export const refreshAccessToken = (refresh) =>
  axiosInstance.post('/api/auth/token/refresh/', { refresh })

// Get current user profile
export const getProfile = () =>
  axiosInstance.get('/api/auth/users/me/')

// Update profile
export const updateProfile = (data) =>
  axiosInstance.patch('/api/auth/users/me/', data)

// Register new user (if signup flow)
export const registerUser = (data) =>
  axiosInstance.post('/api/auth/users/register/', data)
