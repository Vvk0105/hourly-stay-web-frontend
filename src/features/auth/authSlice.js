import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,          // { id, name, email, phone, avatar }
  token: null,         // access token (JWT)
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload
      if (user) state.user = user
      if (token) state.token = token
      if (refreshToken) state.refreshToken = refreshToken
      state.isAuthenticated = true
      state.error = null
      state.loading = false
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
  },
})

export const {
  setCredentials,
  updateUser,
  setAuthLoading,
  setAuthError,
  logout,
} = authSlice.actions

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
