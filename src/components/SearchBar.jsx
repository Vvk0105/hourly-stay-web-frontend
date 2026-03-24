import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, Search } from 'lucide-react'
import {
  setCity,
  setDates,
  setGuests,
  setBookingMode,
  selectCity,
  selectCheckIn,
  selectCheckOut,
  selectGuests,
  selectBookingMode,
} from '@/features/search/searchSlice'
import { cn } from '@/utils/cn'

const SearchBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const city = useSelector(selectCity)
  const checkIn = useSelector(selectCheckIn)
  const checkOut = useSelector(selectCheckOut)
  const guests = useSelector(selectGuests)
  const bookingMode = useSelector(selectBookingMode)

  const [localCity, setLocalCity] = useState(city)

  const modeLabel = {
    hourly: { check: 'Date & Time', hint: 'Hourly slots available — select check-in and check-out time' },
    daily:  { check: 'Date',        hint: 'Select check-in and check-out dates for daily stays' },
  }

  const handleSearch = () => {
    dispatch(setCity(localCity))
    navigate(`/hotels?city=${encodeURIComponent(localCity)}&mode=${bookingMode}&guests=${guests}`)
  }

  const today = new Date().toISOString().slice(0, 16)

  return (
    <div className="bg-white rounded-[28px] shadow-premium overflow-hidden">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 px-6">
        {['hourly', 'daily'].map((mode) => (
          <button
            key={mode}
            onClick={() => dispatch(setBookingMode(mode))}
            className={cn(
              'flex items-center gap-2 px-6 py-4 font-bold text-sm relative transition-colors',
              bookingMode === mode ? 'text-hero-light' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            {mode === 'hourly' ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
            {mode === 'hourly' ? 'Hourly Stays' : 'Daily Stays'}
            {bookingMode === mode && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Location */}
          <div className="search-field">
            <label><MapPin className="inline w-3 h-3 mr-1" />LOCATION</label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={localCity}
              onChange={(e) => setLocalCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Check-in */}
          <div className="search-field">
            <label><Calendar className="inline w-3 h-3 mr-1" />CHECK-IN</label>
            <input
              type={bookingMode === 'hourly' ? 'datetime-local' : 'date'}
              value={checkIn ?? ''}
              min={today}
              onChange={(e) => dispatch(setDates({ checkIn: e.target.value, checkOut: checkOut }))}
            />
          </div>

          {/* Check-out */}
          <div className="search-field">
            <label><Calendar className="inline w-3 h-3 mr-1" />CHECK-OUT</label>
            <input
              type={bookingMode === 'hourly' ? 'datetime-local' : 'date'}
              value={checkOut ?? ''}
              min={checkIn ?? today}
              onChange={(e) => dispatch(setDates({ checkIn: checkIn, checkOut: e.target.value }))}
            />
          </div>

          {/* Guests */}
          <div className="search-field">
            <label><Users className="inline w-3 h-3 mr-1" />GUESTS</label>
            <select value={guests} onChange={(e) => dispatch(setGuests(Number(e.target.value)))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-btn-hover"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Search className="w-5 h-5" />
            Search Available Rooms
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-400">
          ℹ {modeLabel[bookingMode]?.hint}
        </p>
      </div>
    </div>
  )
}

export default SearchBar
