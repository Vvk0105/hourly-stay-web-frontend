import { configureStore } from '@reduxjs/toolkit'
import authReducer, { setCredentials, logout } from '@/features/auth/authSlice'
import searchReducer from '@/features/search/searchSlice'
import bookingReducer from '@/features/booking/bookingSlice'
import wishlistReducer from '@/features/wishlist/wishlistSlice'
import notificationsReducer from '@/features/notifications/notificationsSlice'

// ─── Simple localStorage persistence for auth state ─────────────────────────
const AUTH_KEY = 'hs_auth'

const loadAuthState = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

const saveAuthState = (state) => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      user: state.user,
      token: state.token,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
    }))
  } catch {
    // quota exceeded or private mode — ignore
  }
}

const clearAuthState = () => {
  try { localStorage.removeItem(AUTH_KEY) } catch {}
}

// Restore persisted auth into preloaded state
const persistedAuth = loadAuthState()
const preloadedState = persistedAuth
  ? { auth: { ...persistedAuth, loading: false, error: null } }
  : undefined

const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    booking: bookingReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
  },
  preloadedState,
  devTools: import.meta.env.DEV,
})

// Subscribe to store changes and persist auth slice
store.subscribe(() => {
  const { auth } = store.getState()
  if (auth.isAuthenticated) {
    saveAuthState(auth)
  } else {
    clearAuthState()
  }
})

export default store
