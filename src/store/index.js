import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import searchReducer from '@/features/search/searchSlice'
import bookingReducer from '@/features/booking/bookingSlice'
import wishlistReducer from '@/features/wishlist/wishlistSlice'
import notificationsReducer from '@/features/notifications/notificationsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    booking: bookingReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
  },
  devTools: import.meta.env.DEV,
})

export default store
