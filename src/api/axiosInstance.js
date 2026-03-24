import axios from 'axios'
import store from '@/store'
import { logout, setCredentials } from '@/features/auth/authSlice'
import { setGlobalError } from '@/features/notifications/notificationsSlice'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — handle 401 / global errors
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = store.getState().auth.refreshToken
        if (!refreshToken) throw new Error('No refresh token')

        const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const newToken = response.data.access
        store.dispatch(setCredentials({ token: newToken }))
        processQueue(null, newToken)

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(logout())
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Global error banner for 5xx
    if (error.response?.status >= 500) {
      store.dispatch(setGlobalError('Server error. Please try again later.'))
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
