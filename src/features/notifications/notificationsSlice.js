import { createSlice } from '@reduxjs/toolkit'

let nextId = 1

const initialState = {
  toasts: [],       // [{ id, message, type, duration }]
  unreadCount: 0,
  globalError: null,  // string | null
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const toast = {
        id: nextId++,
        message: action.payload.message,
        type: action.payload.type ?? 'info',  // 'success' | 'error' | 'warning' | 'info'
        duration: action.payload.duration ?? 4000,
      }
      state.toasts.push(toast)
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    clearAllToasts: (state) => {
      state.toasts = []
    },
    setGlobalError: (state, action) => {
      state.globalError = action.payload
    },
    clearGlobalError: (state) => {
      state.globalError = null
    },
    incrementUnread: (state) => {
      state.unreadCount += 1
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
    clearUnread: (state) => {
      state.unreadCount = 0
    },
  },
})

export const {
  addToast,
  removeToast,
  clearAllToasts,
  setGlobalError,
  clearGlobalError,
  incrementUnread,
  setUnreadCount,
  clearUnread,
} = notificationsSlice.actions

// Selectors
export const selectToasts = (state) => state.notifications.toasts
export const selectUnreadCount = (state) => state.notifications.unreadCount
export const selectGlobalError = (state) => state.notifications.globalError

export default notificationsSlice.reducer
