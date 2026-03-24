import Navbar from '@/components/Navbar'
import NotificationToast from '@/components/NotificationToast'
import { useSelector } from 'react-redux'
import { selectGlobalError } from '@/features/notifications/notificationsSlice'
import { AlertTriangle } from 'lucide-react'

const MainLayout = ({ children }) => {
  const globalError = useSelector(selectGlobalError)

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <Navbar />

      {/* Global error banner */}
      {globalError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2 text-red-700 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {globalError}
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Global notifications */}
      <NotificationToast />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-white font-bold text-lg mb-3">⏳ HourlyStay</h5>
              <p className="text-sm leading-relaxed">
                India's first hourly hotel booking platform. Pay only for the hours you stay.
              </p>
              <div className="flex gap-4 mt-4 text-lg">
                <span className="cursor-pointer hover:text-white transition-colors">𝕏</span>
                <span className="cursor-pointer hover:text-white transition-colors">f</span>
                <span className="cursor-pointer hover:text-white transition-colors">📸</span>
              </div>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-3">Company</h6>
              <ul className="space-y-2 text-sm">
                {['About Us', 'Careers', 'Press'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-3">Support</h6>
              <ul className="space-y-2 text-sm">
                {['Help Center', 'Cancellation Policy', 'Contact Us'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-3">Download App</h6>
              <p className="text-sm mb-3">Get the best experience on mobile</p>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:border-gray-400 transition-colors">
                  🍎 App Store
                </button>
                <button className="flex items-center gap-2 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:border-gray-400 transition-colors">
                  ▶ Google Play
                </button>
              </div>
            </div>
          </div>
          <hr className="border-gray-700 mt-10 mb-6" />
          <p className="text-center text-sm">© 2026 HourlyStay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
