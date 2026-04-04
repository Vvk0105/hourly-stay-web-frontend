import { useDispatch, useSelector } from 'react-redux'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, Search, Loader2, Hotel, Navigation } from 'lucide-react'
import {
  setCity,
  setDates,
  setGuests,
  setBookingMode,
  setSearchCoords,
  selectCity,
  selectCheckIn,
  selectCheckOut,
  selectGuests,
  selectBookingMode,
  selectUserLat,
  selectUserLng,
} from '@/features/search/searchSlice'
import { getSearchSuggestions } from '@/api/hotels'
import { cn } from '@/utils/cn'

const SearchBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const city = useSelector(selectCity)
  const checkIn = useSelector(selectCheckIn)
  const checkOut = useSelector(selectCheckOut)
  const guests = useSelector(selectGuests)
  const bookingMode = useSelector(selectBookingMode)
  const userLat = useSelector(selectUserLat)
  const userLng = useSelector(selectUserLng)

  const [localCity, setLocalCity] = useState(city)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState(null) // { lat, lng } from suggestion

  const debounceRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Debounced suggestion fetch on every keystroke
  const fetchSuggestions = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const res = await getSearchSuggestions(query)
        const list = res.data?.suggestions ?? []
        setSuggestions(list)
        setShowSuggestions(list.length > 0)
      } catch {
        // silent fail
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setLocalCity(val)
    setSelectedCoords(null)
    fetchSuggestions(val)
  }

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false)
    setLocalCity(suggestion.label)
    dispatch(setCity(suggestion.label))

    if (suggestion.type === 'hotel' && suggestion.hotel_id) {
      navigate(`/hotels/${suggestion.hotel_id}`)
      return
    }

    if (suggestion.lat != null && suggestion.lng != null) {
      const coords = { lat: suggestion.lat, lng: suggestion.lng }
      setSelectedCoords(coords)
      dispatch(setSearchCoords({ lat: suggestion.lat, lng: suggestion.lng, label: suggestion.label }))
    }
  }

  const handleSearch = () => {
    dispatch(setCity(localCity))

    const lat = selectedCoords?.lat ?? userLat
    const lng = selectedCoords?.lng ?? userLng

    const params = new URLSearchParams()
    if (localCity) params.set('city', localCity)
    if (lat) params.set('lat', lat)
    if (lng) params.set('lng', lng)
    params.set('mode', bookingMode)
    params.set('guests', guests)
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)

    navigate(`/hotels?${params.toString()}`)
  }

  const modeLabel = {
    hourly: { check: 'Date & Time', hint: 'Hourly slots available — select check-in and check-out time' },
    daily:  { check: 'Date',        hint: 'Select check-in and check-out dates for daily stays' },
  }

  const today = new Date().toISOString().slice(0, 16)

  const iconForType = (type) => {
    if (type === 'hotel') return <Hotel className="w-3.5 h-3.5 text-brand-500" />
    if (type === 'area') return <Navigation className="w-3.5 h-3.5 text-blue-500" />
    return <MapPin className="w-3.5 h-3.5 text-gray-400" />
  }

  return (
    <div className="bg-white rounded-[28px] shadow-premium overflow-visible">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 px-6 rounded-t-[28px]">
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
          {/* Location with suggestions */}
          <div className="search-field relative" style={{ overflow: 'visible' }}>
            <label><MapPin className="inline w-3 h-3 mr-1" />LOCATION</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Where are you going?"
                value={localCity}
                onChange={handleInputChange}
                onFocus={() => localCity.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { setShowSuggestions(false); handleSearch() }
                  if (e.key === 'Escape') setShowSuggestions(false)
                }}
                autoComplete="off"
              />
              {loadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-72 overflow-y-auto"
                style={{ minWidth: '280px' }}
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {iconForType(s.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.label}</p>
                      <p className="text-xs text-gray-400 capitalize">{s.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
