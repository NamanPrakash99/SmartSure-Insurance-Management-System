import { useState, useEffect } from 'react'
import { authService } from '../../api/authService'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLocationMarker,
  HiOutlineBadgeCheck,
  HiOutlineShieldCheck
} from 'react-icons/hi'

export default function Profile() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data } = await authService.getUserById(authUser.id)
      setUser(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || ''
      })
    } catch (error) {
      toast.error('Failed to fetch profile details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authService.updateProfile(authUser.id, formData)
      toast.success('Profile updated successfully!')
      fetchProfile() 
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
            User Profile <HiOutlineBadgeCheck className="text-primary-500" />
          </h1>
          <p className="text-surface-500 font-medium">Manage your personal information and contact details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Account Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-6">
            <div className="text-xs font-black text-surface-400 uppercase tracking-widest border-b border-surface-100 dark:border-surface-800 pb-2">Account Info</div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiOutlineMail className="text-primary-500 text-lg" />
                <div className="overflow-hidden">
                  <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Email Address</div>
                  <div className="text-sm font-bold text-surface-900 dark:text-white truncate">{user?.email}</div>
                  <div className="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">Verified Account</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiOutlineShieldCheck className="text-primary-500 text-lg" />
                <div>
                  <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">User Role</div>
                  <div className="text-sm font-bold text-surface-900 dark:text-white uppercase">{user?.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiOutlineUser className="text-primary-500 text-lg" />
                <div>
                  <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Account ID</div>
                  <div className="text-sm font-bold text-surface-900 dark:text-white">#{user?.id}</div>
                </div>
              </div>
            </div>

            <div className="bg-primary-500/5 p-4 rounded-xl border border-primary-500/10">
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium leading-relaxed italic">
                Email address cannot be changed as it is used for primary identification and secure correspondence.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-2">
          <div className="card p-8 md:p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
             
             <form onSubmit={handleUpdate} className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Full Name</label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input 
                        type="text" 
                        required
                        className="input-field pl-10 !py-3 w-full"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Phone Number</label>
                    <div className="relative">
                      <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input 
                        type="text" 
                        required
                        className="input-field pl-10 !py-3 w-full"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Residential Address</label>
                  <div className="relative">
                    <HiOutlineLocationMarker className="absolute left-3 top-4 text-surface-400" />
                    <textarea 
                      required
                      rows="3"
                      className="input-field pl-10 !py-3 w-full"
                      placeholder="Street, City, State, Zip"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
                   <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary !px-10 !py-3 flex items-center justify-center gap-2 group min-w-[160px]"
                   >
                     {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (
                       <>
                        Save Changes
                        <HiOutlineBadgeCheck className="text-xl group-hover:scale-110 transition-transform" />
                       </>
                     )}
                   </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>
  )
}
