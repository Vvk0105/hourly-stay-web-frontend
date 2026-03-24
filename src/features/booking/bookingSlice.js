import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  hotel: null,        // { id, name, location, image, ... }
  room: null,         // { id, name, price, ... }
  checkIn: null,      // ISO string
  checkOut: null,     // ISO string
  guests: 1,
  bookingMode: 'hourly',
  extras: [],         // [{ id, name, price }]
  totalPrice: 0,
  step: 0,            // 0=hotel, 1=room, 2=extras, 3=payment, 4=confirmation
  bookingReference: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingHotel: (state, action) => {
      state.hotel = action.payload
    },
    setBookingRoom: (state, action) => {
      state.room = action.payload
      state.totalPrice = calculateTotal(state)
    },
    setBookingDates: (state, action) => {
      state.checkIn = action.payload.checkIn
      state.checkOut = action.payload.checkOut
      state.totalPrice = calculateTotal(state)
    },
    setBookingGuests: (state, action) => {
      state.guests = action.payload
    },
    setBookingMode: (state, action) => {
      state.bookingMode = action.payload
    },
    addExtra: (state, action) => {
      const existing = state.extras.find((e) => e.id === action.payload.id)
      if (!existing) {
        state.extras.push(action.payload)
        state.totalPrice = calculateTotal(state)
      }
    },
    removeExtra: (state, action) => {
      state.extras = state.extras.filter((e) => e.id !== action.payload)
      state.totalPrice = calculateTotal(state)
    },
    setBookingStep: (state, action) => {
      state.step = action.payload
    },
    setBookingReference: (state, action) => {
      state.bookingReference = action.payload
    },
    clearBooking: () => initialState,
  },
})

// Helper to recalculate total
function calculateTotal(state) {
  const roomPrice = state.room?.price ?? 0
  const extrasTotal = state.extras.reduce((sum, e) => sum + (e.price ?? 0), 0)
  return roomPrice + extrasTotal
}

export const {
  setBookingHotel,
  setBookingRoom,
  setBookingDates,
  setBookingGuests,
  setBookingMode,
  addExtra,
  removeExtra,
  setBookingStep,
  setBookingReference,
  clearBooking,
} = bookingSlice.actions

// Selectors
export const selectBookingHotel = (state) => state.booking.hotel
export const selectBookingRoom = (state) => state.booking.room
export const selectBookingDates = (state) => ({
  checkIn: state.booking.checkIn,
  checkOut: state.booking.checkOut,
})
export const selectBookingExtras = (state) => state.booking.extras
export const selectBookingTotal = (state) => state.booking.totalPrice
export const selectBookingStep = (state) => state.booking.step
export const selectBookingReference = (state) => state.booking.bookingReference

export default bookingSlice.reducer
