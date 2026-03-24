import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  city: '',
  checkIn: null,        // ISO string
  checkOut: null,       // ISO string
  guests: 1,
  bookingMode: 'hourly', // 'hourly' | 'daily'
  priceRange: [0, 5000],
  filters: {
    amenities: [],      // ['WiFi', 'Pool', 'AC', ...]
    rating: 0,          // minimum rating
    sortBy: 'recommended', // 'recommended' | 'price_asc' | 'price_desc' | 'rating'
  },
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCity: (state, action) => {
      state.city = action.payload
    },
    setCheckIn: (state, action) => {
      state.checkIn = action.payload
    },
    setCheckOut: (state, action) => {
      state.checkOut = action.payload
    },
    setDates: (state, action) => {
      state.checkIn = action.payload.checkIn
      state.checkOut = action.payload.checkOut
    },
    setGuests: (state, action) => {
      state.guests = action.payload
    },
    setBookingMode: (state, action) => {
      state.bookingMode = action.payload // 'hourly' | 'daily'
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setAmenityFilter: (state, action) => {
      const amenity = action.payload
      const idx = state.filters.amenities.indexOf(amenity)
      if (idx === -1) {
        state.filters.amenities.push(amenity)
      } else {
        state.filters.amenities.splice(idx, 1)
      }
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload
    },
    setRatingFilter: (state, action) => {
      state.filters.rating = action.payload
    },
    resetSearch: () => initialState,
  },
})

export const {
  setCity,
  setCheckIn,
  setCheckOut,
  setDates,
  setGuests,
  setBookingMode,
  setPriceRange,
  setFilters,
  setAmenityFilter,
  setSortBy,
  setRatingFilter,
  resetSearch,
} = searchSlice.actions

// Selectors
export const selectCity = (state) => state.search.city
export const selectCheckIn = (state) => state.search.checkIn
export const selectCheckOut = (state) => state.search.checkOut
export const selectGuests = (state) => state.search.guests
export const selectBookingMode = (state) => state.search.bookingMode
export const selectPriceRange = (state) => state.search.priceRange
export const selectFilters = (state) => state.search.filters
export const selectSearchParams = (state) => ({
  city: state.search.city,
  checkIn: state.search.checkIn,
  checkOut: state.search.checkOut,
  guests: state.search.guests,
  bookingMode: state.search.bookingMode,
})

export default searchSlice.reducer
