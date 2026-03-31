import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchWishlistHotelsAPI, toggleWishlistHotelAPI } from '@/api/wishlistApi'

// Fetch user's wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchWishlistHotelsAPI()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch wishlist')
    }
  }
)

// Toggle wishlist (Optimistic UI handled in slice reducer)
export const toggleWishlistApi = createAsyncThunk(
  'wishlist/toggleWishlistApi',
  async (hotel, { rejectWithValue }) => {
    try {
      const data = await toggleWishlistHotelAPI(hotel.id)
      return { hotel, is_wishlisted: data.is_wishlisted }
    } catch (err) {
      return rejectWithValue({ hotel, error: err.response?.data || 'Failed to toggle wishlist' })
    }
  }
)

const initialState = {
  hotels: [], // array of hotel objects
  status: 'idle',
  error: null,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.hotels = []
      state.status = 'idle'
      state.error = null
    },
    // Optimistic toggle
    optimisticToggle: (state, action) => {
      const hotel = action.payload
      const idx = state.hotels.findIndex((h) => h.id === hotel.id)
      if (idx === -1) {
        state.hotels.push(hotel)
      } else {
        state.hotels.splice(idx, 1)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.hotels = action.payload || []
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // If the API call fails, revert the optimistic toggle
      .addCase(toggleWishlistApi.rejected, (state, action) => {
        const { hotel } = action.meta.arg
        // Revert the toggle: if it was added optimistically, remove it. If removed, add it back.
        const idx = state.hotels.findIndex((h) => h.id === hotel.id)
        if (idx === -1) {
          state.hotels.push(hotel)
        } else {
          state.hotels.splice(idx, 1)
        }
      })
  },
})

export const { clearWishlist, optimisticToggle } = wishlistSlice.actions

// Selectors
export const selectWishlistHotels = (state) => state.wishlist.hotels
export const selectWishlistCount = (state) => state.wishlist.hotels.length
export const selectIsWishlisted = (hotelId) => (state) =>
  state.wishlist.hotels.some((h) => h.id === hotelId)
export const selectWishlistStatus = (state) => state.wishlist.status

export default wishlistSlice.reducer
