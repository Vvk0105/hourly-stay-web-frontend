import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import HotelCard from '@/components/HotelCard'
import { selectSearchParams } from '@/features/search/searchSlice'
import { getHotels, searchHotels } from '@/api/hotels'
import { Search, Sliders, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

const HotelsPage = () => {
  const [searchParams] = useSearchParams()
  const reduxSearch = useSelector(selectSearchParams)

  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    pricing_type: '', // 'hourly' | 'daily' | 'both'
  })

  const city = searchParams.get('city') || reduxSearch?.city || ''
  const date = searchParams.get('date') || reduxSearch?.date || ''

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (city) params.city = city
      if (date) params.date = date
      if (filters.pricing_type) params.pricing_type = filters.pricing_type

      const res = city
        ? await searchHotels(params)
        : await getHotels(params)

      const results = res.data?.results ?? res.data ?? []
      setHotels(results)
    } catch (err) {
      console.error('Failed to fetch hotels:', err)
      setError('Failed to load hotels. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [city, date, filters.pricing_type])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  // Client-side sort
  const sorted = [...hotels].sort((a, b) => {
    if (sortBy === 'price_asc') {
      const pa = a.pricing?.hourly?.starting_from ?? a.pricing?.daily?.starting_from ?? Infinity
      const pb = b.pricing?.hourly?.starting_from ?? b.pricing?.daily?.starting_from ?? Infinity
      return pa - pb
    }
    if (sortBy === 'price_desc') {
      const pa = a.pricing?.hourly?.starting_from ?? a.pricing?.daily?.starting_from ?? 0
      const pb = b.pricing?.hourly?.starting_from ?? b.pricing?.daily?.starting_from ?? 0
      return pb - pa
    }
    if (sortBy === 'rating') return b.average_rating - a.average_rating
    return 0
  })

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {city ? `Hotels in ${city}` : 'Available Hotels'}
            </h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Searching...' : `${sorted.length} hotel${sorted.length !== 1 ? 's' : ''} found`}
              {date && <span className="ml-2 text-sm text-brand-600 font-medium">for {date}</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all',
                showFilters ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none bg-white hover:border-brand-300 cursor-pointer transition-all"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap gap-4 items-center">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pricing Type</p>
              <div className="flex gap-2">
                {[
                  { value: '', label: 'All' },
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'both', label: 'Both' },
                ].map(o => (
                  <button
                    key={o.value}
                    onClick={() => setFilters(f => ({ ...f, pricing_type: o.value }))}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      filters.pricing_type === o.value
                        ? 'bg-brand-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-brand-500" />
            <p className="font-medium">Finding the best hotels for you...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={fetchHotels}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <Search className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-semibold text-lg">No hotels found</p>
            <p className="text-sm mt-1">Try a different city or date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default HotelsPage
