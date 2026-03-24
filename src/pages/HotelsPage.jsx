import MainLayout from '@/layouts/MainLayout'
import HotelCard from '@/components/HotelCard'
import { useSelector } from 'react-redux'
import { selectSearchParams } from '@/features/search/searchSlice'
import { Search } from 'lucide-react'

const HotelsPage = () => {
  const searchParams = useSelector(selectSearchParams)

  // Placeholder - to be replaced with real API data
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {searchParams.city ? `Hotels in ${searchParams.city}` : 'All Hotels'}
        </h1>
        <p className="text-gray-500 mb-8">Search results will appear here</p>

        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-center text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">Hotel Listing Page</p>
            <p className="text-sm mt-1">Connect backend API to display real hotels</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default HotelsPage
