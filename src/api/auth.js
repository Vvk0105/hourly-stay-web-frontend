import axiosInstance from './axiosInstance'

export const sendOtp = (phone) =>
  axiosInstance.post('/api/v1/users/send-otp/', { phone })

export const verifyOtp = (phone, otp) =>
  axiosInstance.post('/api/v1/auth/users/verify-otp/', { phone, otp })

export const refreshAccessToken = (refresh) =>
  axiosInstance.post('/api/v1/auth/token/refresh/', { refresh })

export const getProfile = () =>
  axiosInstance.get('/api/v1/auth/users/me/')

export const updateProfile = (data) =>
  axiosInstance.patch('/api/v1/auth/users/me/', data)

export const registerUser = (data) =>
  axiosInstance.post('/api/v1/auth/users/register/', data)
