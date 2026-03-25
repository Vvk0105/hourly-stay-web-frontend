import axiosInstance from './axiosInstance'

export const sendOtp = (phone_number) =>
  axiosInstance.post('/api/v1/users/send-otp/', { phone_number })

export const verifyOtp = (phone_number, otp) =>
  axiosInstance.post('/api/v1/users/verify-otp/', { phone_number, otp })

export const refreshAccessToken = (refresh) =>
  axiosInstance.post('/api/v1/users/refresh/', { refresh })

export const getProfile = () =>
  axiosInstance.get('/api/v1/users/profile/')

export const updateProfile = (data) =>
  axiosInstance.patch('/api/v1/users/profile/update/', data)

// Registration is handled automatically by verify-otp for new users
export const registerUser = (data) =>
  axiosInstance.post('/api/v1/users/profile/update/', data)
