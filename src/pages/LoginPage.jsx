import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Phone, KeyRound, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { setCredentials, setAuthLoading, setAuthError } from '@/features/auth/authSlice'
import { fetchWishlist } from '@/features/wishlist/wishlistSlice'
import { useAuth } from '@/hooks/useAuth'
import { useNotify } from '@/hooks/useNotify'
import { sendOtp, verifyOtp, googleLogin } from '@/api/auth'
import { GoogleLogin } from '@react-oauth/google'
import { cn } from '@/utils/cn'

const STEPS = { PHONE: 'phone', OTP: 'otp' }

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 India' },
  { code: '+1', label: '🇺🇸 USA' },
  { code: '+44', label: '🇬🇧 UK' },
  { code: '+971', label: '🇦🇪 UAE' },
  { code: '+65', label: '🇸🇬 Singapore' },
]

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const notify = useNotify()
  const { isAuthenticated, loading } = useAuth()

  const from = location.state?.from?.pathname ?? '/'

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(from, { replace: true })
    return null
  }

  const [step, setStep] = useState(STEPS.PHONE)
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')

  const validatePhone = (val) => {
    const clean = val.replace(/\D/g, '')
    if (!clean || clean.length < 9) return 'Enter a valid 10-digit mobile number'
    return ''
  }

  const getFullPhone = () => {
    return countryCode + phone.replace(/\D/g, '')
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setPhoneError('')

    try {
      dispatch(setAuthLoading(true))
      await sendOtp(getFullPhone())
      setStep(STEPS.OTP)
      notify.success('OTP sent to your phone number!')
    } catch (error) {
      const msg = error.response?.data?.message ?? error.response?.data?.detail ?? 'Failed to send OTP. Try again.'
      dispatch(setAuthError(msg))
      notify.error(msg)
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setOtpError('Enter the 6-digit OTP'); return }
    setOtpError('')

    try {
      dispatch(setAuthLoading(true))
      const res = await verifyOtp(getFullPhone(), otp)
      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.access,
        refreshToken: res.data.refresh,
      }))
      dispatch(fetchWishlist())
      notify.success(`Welcome back, ${res.data.user?.username ?? 'there'}!`)
      navigate(from, { replace: true })
    } catch (error) {
      const msg = error.response?.data?.message ?? error.response?.data?.detail ?? 'Invalid OTP. Please try again.'
      dispatch(setAuthError(msg))
      setOtpError(msg)
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      dispatch(setAuthLoading(true))
      const res = await googleLogin(credentialResponse.credential)
      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.access,
        refreshToken: res.data.refresh,
      }))
      dispatch(fetchWishlist())
      notify.success(`Welcome, ${res.data.user?.username ?? 'there'}!`)
      navigate(from, { replace: true })
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.detail || 'Google sign in failed.'
      dispatch(setAuthError(msg))
      notify.error(msg)
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none top-10 -left-20"
        style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.2), transparent)', filter: 'blur(60px)' }} />
      <div className="absolute w-96 h-96 rounded-full pointer-events-none bottom-10 -right-20"
        style={{ background: 'radial-gradient(circle, rgba(118,75,162,0.2), transparent)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Clock className="w-8 h-8 text-brand-400" />
            <span className="text-3xl font-extrabold text-white">HourlyStay</span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Sign in to book instantly</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-premium p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
              step === STEPS.PHONE ? 'bg-brand-500 text-white' : 'bg-green-100 text-green-700')}>
              {step === STEPS.PHONE ? '1' : <CheckCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1 h-0.5 bg-gray-200">
              <div className={cn('h-full bg-brand-500 transition-all duration-500', step === STEPS.OTP ? 'w-full' : 'w-0')} />
            </div>
            <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
              step === STEPS.OTP ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400')}>
              2
            </div>
          </div>

          {step === STEPS.PHONE ? (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your mobile number to continue</p>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="flex items-center px-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm outline-none cursor-pointer hover:border-brand-400 transition-all appearance-none"
                    style={{ minWidth: '80px' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label.split(' ')[0]} {c.code}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={15}
                      className={cn(
                        'w-full pl-9 pr-3 py-3 rounded-xl border text-sm font-medium outline-none transition-all',
                        phoneError
                          ? 'border-red-300 focus:border-red-400 bg-red-50'
                          : 'border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
                      )}
                    />
                  </div>
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-btn-hover disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {loading ? (
                  <span className="animate-pulse">Sending OTP...</span>
                ) : (
                  <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                By continuing, you agree to our{' '}
                <a href="#" className="text-brand-600 font-medium">Terms</a> &{' '}
                <a href="#" className="text-brand-600 font-medium">Privacy Policy</a>
              </p>
              <p className="text-center text-sm text-gray-500 mt-4">
                New here?{' '}
                <a href="#" className="text-brand-600 font-semibold">Sign up automatically</a> on first login.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Enter OTP</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a 6-digit code to <span className="font-semibold text-gray-700">{getFullPhone()}</span>
              </p>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl border text-lg font-bold tracking-[0.5em] outline-none transition-all text-center',
                      otpError
                        ? 'border-red-300 focus:border-red-400 bg-red-50'
                        : 'border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
                    )}
                  />
                </div>
                {otpError && <p className="text-red-500 text-xs mt-1.5">{otpError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-btn-hover disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {loading ? <span className="animate-pulse">Verifying...</span> : <><span>Verify & Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>

              <button
                type="button"
                onClick={() => { setStep(STEPS.PHONE); setOtp('') }}
                className="w-full mt-3 py-2.5 text-sm text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                ← Change number
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-brand-600 text-sm font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Social Login Separator */}
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => notify.error('Google login failed')}
              useOneTap
              shape="pill"
              theme="outline"
              size="large"
            />
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 HourlyStay · <a href="/" className="hover:text-gray-300 transition-colors">Back to Home</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
