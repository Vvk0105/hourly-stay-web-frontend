import SearchBar from '@/components/SearchBar'
import HotelCard from '@/components/HotelCard'
import MainLayout from '@/layouts/MainLayout'
import { Sparkles, Clock, Shield, Smartphone } from 'lucide-react'

// Demo hotel data matching the Web_Design reference
const DEMO_HOTELS = [
  {
    id: 1,
    name: 'Verification Hotel',
    location: 'Kochi Updated, Kerala',
    rating: 0,
    price: 1,
    price_display: '₹1 / 3 hr',
    extra_price_display: '+₹11 / extra hr',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    amenities: ['TV', 'WiFi', 'AC'],
  },
  {
    id: 2,
    name: 'Grand Plaza Suites',
    location: 'MG Road, Kochi',
    rating: 4.5,
    price: 349,
    price_display: '₹349 / 3 hr',
    extra_price_display: '+₹99 / extra hr',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
    amenities: ['WiFi', 'Restaurant', 'Parking'],
  },
  {
    id: 3,
    name: 'Harbor Luxe Inn',
    location: 'Marine Drive, Kochi',
    rating: 4.8,
    price: 499,
    price_display: '₹499 / 3 hr',
    extra_price_display: '+₹129 / extra hr',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
    amenities: ['Pool', 'Wifi', 'AC'],
  },
  {
    id: 4,
    name: 'Metro Flexi Stay',
    location: 'Kaloor, Kochi',
    rating: 3.9,
    price: 199,
    price_display: '₹199 / 3 hr',
    extra_price_display: '+₹59 / extra hr',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
    amenities: ['WiFi', 'AC'],
  },
  {
    id: 5,
    name: 'Airport Transit Hub',
    location: 'Cochin Airport',
    rating: 4.2,
    price: 250,
    price_display: '₹250 / 3 hr',
    extra_price_display: '+₹75 / extra hr',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
    amenities: ['WiFi', 'Parking'],
  },
  {
    id: 6,
    name: 'Palm Grove Residency',
    location: 'Edappally, Kochi',
    rating: 4.3,
    price: 399,
    price_display: '₹399 / 3 hr',
    extra_price_display: '+₹89 / extra hr',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
    amenities: ['Restaurant', 'WiFi', 'AC'],
  },
]

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
            {DEMO_HOTELS.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
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
