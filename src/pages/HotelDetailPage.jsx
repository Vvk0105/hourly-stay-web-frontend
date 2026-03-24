import MainLayout from '@/layouts/MainLayout'
import { useParams } from 'react-router-dom'
import { Hotel } from 'lucide-react'

const HotelDetailPage = () => {
  const { id } = useParams()

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Hotel Details</h1>
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-center text-gray-400">
            <Hotel className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">Hotel Detail Page (ID: {id})</p>
            <p className="text-sm mt-1">Room selection, photos, reviews — coming soon</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default HotelDetailPage
