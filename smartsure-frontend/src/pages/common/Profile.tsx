import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../api/authService'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import { User } from '../../types'
import { profileSchema, ProfileInput } from '../../schemas/profileSchema'
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineBadgeCheck,
  HiOutlineShieldCheck,
} from 'react-icons/hi'
import { FormInput } from '../../components/common/FormInput'
import { FormTextarea } from '../../components/common/FormTextarea'
import { Button } from '../../components/common/Button'

export default function Profile() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    if (!authUser) return
    setLoading(true)
    const response = await authService.getUserById(authUser.id)
    if (response.success) {
      const data = response.data
      setUser(data)
      // Populate form fields
      reset({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
      })
    } else {
      toast.error('Failed to fetch profile details')
    }
    setLoading(false)
  }

  const handleUpdate = async (data: ProfileInput) => {
    if (!authUser) return
    setSaving(true)
    const response = await authService.updateProfile(authUser.id, data)
    if (response.success) {
      toast.success('Profile updated successfully!')
      fetchProfile()
    } else {
      toast.error(response.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )

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
          <p className="text-surface-500 font-medium">
            Manage your personal information and contact details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Account Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-6">
            <div className="text-xs font-black text-surface-400 uppercase tracking-widest border-b border-surface-100 dark:border-surface-800 pb-2">
              Account Info
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiOutlineMail className="text-primary-500 text-lg" />
                <div className="overflow-hidden">
                  <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                    Email Address
                  </div>
                  <div className="text-sm font-bold text-surface-900 dark:text-white truncate">
                    {user?.email}
                  </div>
                  <div className="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">
                    Verified Account
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiOutlineShieldCheck className="text-primary-500 text-lg" />
                <div>
                  <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                    User Role
                  </div>
                  <div className="text-sm font-bold text-surface-900 dark:text-white uppercase">
                    {user?.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiOutlineUser className="text-primary-500 text-lg" />
                <div>
                  <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                    Account ID
                  </div>
                  <div className="text-sm font-bold text-surface-900 dark:text-white">#{user?.id}</div>
                </div>
              </div>
            </div>

            <div className="bg-primary-500/5 p-4 rounded-xl border border-primary-500/10">
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium leading-relaxed italic">
                Email address cannot be changed as it is used for primary identification and secure
                correspondence.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-2">
          <div className="card p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

            <form onSubmit={handleSubmit(handleUpdate)} className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Full Name"
                  leftIcon={<HiOutlineUser />}
                  error={errors.name?.message}
                  placeholder="John Doe"
                  {...register('name')}
                />
                <FormInput
                  label="Phone Number"
                  leftIcon={<HiOutlinePhone />}
                  error={errors.phone?.message}
                  placeholder="+91 00000 00000"
                  {...register('phone')}
                />
              </div>

              <FormTextarea
                label="Residential Address"
                leftIcon={<HiOutlineLocationMarker />}
                error={errors.address?.message}
                placeholder="Street, City, State, Zip"
                rows={3}
                {...register('address')}
              />

              <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
                <Button
                  type="submit"
                  isLoading={saving}
                  size="lg"
                  className="min-w-[160px]"
                  rightIcon={<HiOutlineBadgeCheck className="text-xl group-hover:scale-110 transition-transform" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
