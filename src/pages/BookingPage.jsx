import MainLayout from '@/layouts/MainLayout'
import { useSelector } from 'react-redux'
import { selectBookingHotel, selectBookingRoom, selectBookingTotal } from '@/features/booking/bookingSlice'
import { CalendarCheck } from 'lucide-react'

const BookingPage = () => {
  const hotel = useSelector(selectBookingHotel)
  const room = useSelector(selectBookingRoom)
  const total = useSelector(selectBookingTotal)

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Complete Your Booking</h1>

        {hotel ? (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{hotel.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{hotel.location}</p>
            {room && <p className="text-sm text-gray-700">Room: <span className="font-semibold">{room.name}</span></p>}
            {total > 0 && (
              <p className="mt-3 text-2xl font-extrabold text-brand-600">
                ₹{total.toLocaleString('en-IN')}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400 text-sm">Booking checkout flow — coming soon</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-center text-gray-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No booking in progress</p>
              <p className="text-sm mt-1">Select a hotel first to start booking</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default BookingPage
