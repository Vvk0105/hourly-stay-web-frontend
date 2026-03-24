import MainLayout from '@/layouts/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { User, Phone, Mail } from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name ?? 'User'}</h2>
              <p className="text-gray-500 text-sm">HourlyStay Member</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: User, label: 'Name', value: user?.name ?? '—' },
              { icon: Phone, label: 'Phone', value: user?.phone ?? '—' },
              { icon: Mail, label: 'Email', value: user?.email ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Icon className="w-4 h-4 text-brand-500" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400 text-sm">Edit profile & booking history — coming soon</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default ProfilePage
