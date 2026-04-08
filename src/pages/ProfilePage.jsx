import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MainLayout from '@/layouts/MainLayout'
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice'
import { getProfile, updateProfile, changePhoneRequest, changePhoneVerify, deleteAccount } from '@/api/auth'
import {
  User, Phone, Mail, Edit2, Check, X, Loader2,
  Shield, Camera, ChevronRight, Lock, Bell, LogOut,
  AlertCircle, CheckCircle, Smartphone, Trash2
} from 'lucide-react'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'
import { logout } from '@/features/auth/authSlice'

const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-emerald-500 to-teal-700',
  'from-orange-500 to-pink-600',
  'from-purple-500 to-indigo-700',
]

// ──── Phone Change Modal ──────────────────────────────────────────────────────
const PhoneChangeModal = ({ currentPhone, onClose, onSuccess }) => {
  const [step, setStep] = useState(1) // 1=enter new phone, 2=OTP verify
  const [newPhone, setNewPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleRequestOTP = async () => {
    if (!newPhone.trim()) { setErrorMsg('Enter a valid phone number'); return }
    setLoading(true)
    setErrorMsg('')
    try {
      await changePhoneRequest(newPhone.trim())
      toast.success('OTP sent to your new number!')
      setStep(2)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.new_phone_number?.[0] || 'Failed to send OTP'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim()) { setErrorMsg('Enter the OTP'); return }
    setLoading(true)
    setErrorMsg('')
    try {
      await changePhoneVerify(newPhone.trim(), otp.trim())
      toast.success('Phone number updated successfully!')
      onSuccess(newPhone.trim())
      onClose()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.otp?.[0] || 'Invalid OTP'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Change Phone Number</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 ? 'Enter your new phone number' : 'Enter the OTP sent to your phone'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step >= s ? 'text-white' : 'bg-gray-100 text-gray-400'
                )}
                  style={step >= s ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : {}}>
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 2 && <div className={cn('flex-1 h-0.5 w-8', step > s ? 'bg-brand-400' : 'bg-gray-200')} />}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-1">{step === 1 ? 'New Number' : 'Verify OTP'}</span>
          </div>

          {step === 1 ? (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                New Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => { setNewPhone(e.target.value); setErrorMsg('') }}
                  placeholder="+91 9876543210"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
              {currentPhone && (
                <p className="text-xs text-gray-400 mt-1.5">Current: {currentPhone}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Enter OTP
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setErrorMsg('') }}
                  placeholder="6-digit OTP"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors tracking-widest font-bold"
                />
              </div>
              <button onClick={() => setStep(1)} className="text-xs text-brand-600 font-semibold mt-1.5 hover:underline">
                ← Change phone number
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            onClick={step === 1 ? handleRequestOTP : handleVerifyOTP}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {step === 1 ? 'Send OTP' : 'Verify & Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ──── Delete Account Modal ──────────────────────────────────────────────────────
const DeleteAccountModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      await deleteAccount()
      toast.success('Account deleted successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete account'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Delete Account?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.
        </p>
        
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ──── Profile Page ─────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useDispatch()
  const storeUser = useSelector(selectCurrentUser)

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Editable fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProfile()
        setProfileData(res.data)
        const u = res.data.username || ''
        setUsername(u)
        setEmail(res.data.email || '')
      } catch {
        // Fall back to Redux store
        if (storeUser) {
          setProfileData(storeUser)
          setUsername(storeUser.username || storeUser.name || '')
        }
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const payload = {}
      if (username !== profileData?.username) payload.username = username
      if (!profileData?.email && email.trim()) payload.email = email.trim()
      if (Object.keys(payload).length === 0) { setEditing(false); setSaving(false); return }

      const res = await updateProfile(payload)
      setProfileData(res.data)
      dispatch(updateUser({ 
        username: res.data.username,
        name: res.data.username
      }))
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handlePhoneSuccess = (newPhone) => {
    setProfileData(prev => ({ ...prev, phone_number: newPhone, phone: newPhone }))
    dispatch(updateUser({ phone_number: newPhone, phone: newPhone }))
  }

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  const data = profileData || storeUser
  const displayName = username || data?.username || data?.name || data?.email?.split('@')[0] || 'User'
  const phoneNumber = data?.phone_number || data?.phone || '—'
  const userId = data?.uuid || data?.id
  const avatarGrad = AVATAR_GRADIENTS[(displayName.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      {showPhoneModal && (
        <PhoneChangeModal
          currentPhone={phoneNumber}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={handlePhoneSuccess}
        />
      )}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleLogout}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        {/* Avatar + Name Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-3xl font-extrabold text-white`}>
                {displayName[0]?.toUpperCase() ?? 'U'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400"
                    />
                  </div>
                  {!data?.email && (
                    <div className="mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Email Address (Cannot be changed later)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-all"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setUsername(profileData?.username || '') }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                      <X className="w-3.5 h-3.5" />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">{displayName}</h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {data?.role ? data.role.replace('_', ' ') : 'HourlyStay Member'}
                      </p>
                    </div>
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:border-brand-300 hover:text-brand-600 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />Edit
                    </button>
                  </div>
                  {data?.member_since && (
                    <p className="text-xs text-gray-400 mt-1">
                      Member since {new Date(data.member_since).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-5">
          <h3 className="font-extrabold text-gray-900 text-base mb-4">Contact Information</h3>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</p>
                <p className="font-semibold text-gray-800 text-sm truncate">{data?.email || 'Not provided'}</p>
              </div>
              {data?.email ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-1 rounded-lg">
                  <Lock className="w-3 h-3" />Read-only
                </span>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-brand-600 text-xs font-semibold hover:bg-brand-50 hover:border-brand-300 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />Add
                </button>
              )}
            </div>

            {/* Phone — changeable */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone Number</p>
                <p className="font-semibold text-gray-800 text-sm">{phoneNumber}</p>
              </div>
              <button
                onClick={() => setShowPhoneModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-brand-600 text-xs font-semibold hover:bg-brand-50 hover:border-brand-300 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />Change
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        {(data?.role || userId) && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-5">
            <h3 className="font-extrabold text-gray-900 text-base mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              {data?.role && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{data.role?.toLowerCase().replace('_', ' ')}</span>
                </div>
              )}
              {userId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-xs text-gray-500 truncate max-w-[200px]">{userId}</span>
                </div>
              )}
              {data?.is_verified != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified</span>
                  <span className={cn('font-semibold flex items-center gap-1', data.is_verified ? 'text-green-600' : 'text-amber-600')}>
                    {data.is_verified ? <><CheckCircle className="w-3.5 h-3.5" />Yes</> : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-5">
          {[
            { icon: Shield, label: 'My Bookings', href: '/bookings', color: 'text-brand-600' },
            { icon: Bell, label: 'Notifications', href: '/notifications', color: 'text-amber-600' },
          ].map(({ icon: Icon, label, href, color }) => (
            <a key={label} href={href}
              className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <Icon className={cn('w-5 h-5', color)} />
              <span className="font-semibold text-gray-800 text-sm flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </a>
          ))}
        </div>

        {/* Logout & Delete */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />Sign Out
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />Delete Account
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </MainLayout>
  )
}

export default ProfilePage
