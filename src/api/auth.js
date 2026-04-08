import axiosInstance from './axiosInstance'

export const sendOtp = (phone_number) =>
  axiosInstance.post('/api/v1/users/send-otp/', { phone_number })

export const verifyOtp = (phone_number, otp) =>
  axiosInstance.post('/api/v1/users/verify-otp/', { phone_number, otp })

export const googleLogin = (id_token) =>
  axiosInstance.post('/api/v1/users/auth/google/', { id_token })

export const refreshAccessToken = (refresh) =>
  axiosInstance.post('/api/v1/users/refresh/', { refresh })

export const getProfile = () =>
  axiosInstance.get('/api/v1/users/profile/')

export const updateProfile = (data) =>
  axiosInstance.patch('/api/v1/users/profile/update/', data)

// Two-step phone number change flow
export const changePhoneRequest = (new_phone_number) =>
  axiosInstance.post('/api/v1/users/profile/change-phone/request/', { new_phone_number })

export const changePhoneVerify = (new_phone_number, otp) =>
  axiosInstance.post('/api/v1/users/profile/change-phone/verify/', { new_phone_number, otp })

// Registration is handled automatically by verify-otp for new users
export const registerUser = (data) =>
  axiosInstance.post('/api/v1/users/profile/update/', data)

export const deleteAccount = () =>
  axiosInstance.delete('/api/v1/users/profile/delete/')
