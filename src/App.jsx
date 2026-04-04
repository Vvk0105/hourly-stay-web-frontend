import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import HotelsPage from '@/pages/HotelsPage'
import HotelDetailPage from '@/pages/HotelDetailPage'
import WishlistPage from '@/pages/WishlistPage'
import BookingPage from '@/pages/BookingPage'
import BookingBreakdownPage from '@/pages/BookingBreakdownPage'
import BookingSuccessPage from '@/pages/BookingSuccessPage'
import ProfilePage from '@/pages/ProfilePage'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />

        {/* Booking flow — breakdown is public (allows guest booking), success and my-bookings require auth */}
        <Route path="/booking/breakdown" element={<BookingBreakdownPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />

        {/* Protected routes */}
        <Route path="/wishlist" element={
          <ProtectedRoute><WishlistPage /></ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
