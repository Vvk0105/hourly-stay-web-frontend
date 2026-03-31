import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import HotelsPage from '@/pages/HotelsPage'
import HotelDetailPage from '@/pages/HotelDetailPage'
import WishlistPage from '@/pages/WishlistPage'
import BookingPage from '@/pages/BookingPage'
import ProfilePage from '@/pages/ProfilePage'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/hotels" element={<HotelsPage />} />
      <Route path="/hotels/:id" element={<HotelDetailPage />} />

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
