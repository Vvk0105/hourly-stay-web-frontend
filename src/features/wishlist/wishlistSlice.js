import { createSlice } from '@reduxjs/toolkit'

// Persist wishlist to localStorage
const loadWishlist = () => {
  try {
    const raw = localStorage.getItem('hs_wishlist')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveWishlist = (hotels) => {
  try {
    localStorage.setItem('hs_wishlist', JSON.stringify(hotels))
  } catch {
    /* ignore */
  }
}

const initialState = {
  hotels: loadWishlist(), // array of hotel objects
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const hotel = action.payload
      if (!state.hotels.find((h) => h.id === hotel.id)) {
        state.hotels.push(hotel)
        saveWishlist(state.hotels)
      }
    },
    removeFromWishlist: (state, action) => {
      state.hotels = state.hotels.filter((h) => h.id !== action.payload)
      saveWishlist(state.hotels)
    },
    toggleWishlist: (state, action) => {
      const hotel = action.payload
      const idx = state.hotels.findIndex((h) => h.id === hotel.id)
      if (idx === -1) {
        state.hotels.push(hotel)
      } else {
        state.hotels.splice(idx, 1)
      }
      saveWishlist(state.hotels)
    },
    clearWishlist: (state) => {
      state.hotels = []
      saveWishlist([])
    },
  },
})

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions

// Selectors
export const selectWishlistHotels = (state) => state.wishlist.hotels
export const selectWishlistCount = (state) => state.wishlist.hotels.length
export const selectIsWishlisted = (hotelId) => (state) =>
  state.wishlist.hotels.some((h) => h.id === hotelId)

export default wishlistSlice.reducer
