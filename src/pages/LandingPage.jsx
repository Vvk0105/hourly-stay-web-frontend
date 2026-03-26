import SearchBar from '@/components/SearchBar'
import HotelCard from '@/components/HotelCard'
import MainLayout from '@/layouts/MainLayout'
import { Sparkles, Clock, Shield, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getHotels } from '@/api/hotels'


const USP_FEATURES = [
  {
    icon: Clock,
    title: 'Pay by the Hour',
    desc: 'No full-day charges. Book for exactly as long as you need — 2 hours or 10.',
    color: 'from-brand-500 to-brand-700',
  },
  {
    icon: Shield,
    title: 'Verified Hotels',
    desc: 'Every property is verified for quality, hygiene, and safe check-in.',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    icon: Smartphone,
    title: 'Instant Confirmation',
    desc: 'Get booking confirmed in seconds, not hours. Check in with your phone.',
    color: 'from-orange-400 to-pink-500',
  },
  {
    icon: Sparkles,
    title: 'Exclusive Deals',
    desc: 'Members-only prices on top hotels. Save up to 40% on every booking.',
    color: 'from-purple-400 to-indigo-600',
  },
]

const LandingPage = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect (() => {
    const fetchHotels = async () => {
      try{
        const res = await getHotels()
        console.log('Hotels', res.data)
        setHotels(res.data.results || res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHotels()
  },[])

  return (
    <MainLayout>
      {/* Hero Section */}
      <section
        className="relative py-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)' }}
      >
        {/* Blur blobs */}
        <div
          className="absolute w-72 h-72 rounded-full pointer-events-none"
          style={{
            top: '5%', left: '-5%',
            background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.1) 100%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full pointer-events-none"
          style={{
            bottom: '5%', right: '-5%',
            background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.1) 100%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-300 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> India's #1 Hourly Hotel Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Book Hotels <br />
              <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                By The Hour
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Pay only for the time you need. Perfect for layovers, meetings, rest, or a quick getaway.
            </p>
          </div>

          {/* Search Card */}
          <div className="max-w-5xl mx-auto">
            <SearchBar />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-center">
            {[
              { label: 'Hotels', value: '500+' },
              { label: 'Cities', value: '50+' },
              { label: 'Bookings', value: '1L+' },
              { label: 'Rating', value: '4.8★' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HourlyStay */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Why HourlyStay?</h2>
            <p className="text-gray-500">Smarter stays for the modern traveler</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {USP_FEATURES.map((f) => (
              <div key={f.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-4`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Hotels */}
      <section className="py-16" id="hotels">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Available Hotels</h2>
              <p className="text-gray-500">Flexible hourly stays with premium amenities</p>
            </div>
            <a href="/hotels" className="text-brand-600 font-semibold text-sm hover:underline hidden md:block">
              View all →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p>Loading hotels...</p>
            ) : hotels.length === 0 ? (
              <p>No hotels found</p>
            ) : (
              hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 mx-4 mb-8 rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to book smarter?</h2>
          <p className="text-purple-100 mb-6">Create a free account and get ₹200 off your first booking.</p>
          <a
            href="/login"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </MainLayout>
  )
}

export default LandingPage
