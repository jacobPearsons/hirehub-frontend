import { useState, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, changePassword, uploadAvatar } from '../../api/auth'
import { useToast } from '../ui/Toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  companyName: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
      companyName: user?.companyName ?? '',
    },
  })

  const bioValue = useWatch({ control, name: 'bio' })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  async function onProfileSubmit(data: ProfileFormData) {
    try {
      const res = await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        bio: data.bio || null,
        companyName: user?.role === 'employer' ? (data.companyName || null) : null,
      })
      setUser({
        ...user!,
        ...res.data,
        role: user!.role,
      })
      showToast('success', 'Profile updated successfully')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  async function onPasswordSubmit(data: PasswordFormData) {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      resetPassword()
      showToast('success', 'Password updated successfully')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Avatar must be under 5 MB')
      return
    }

    try {
      setUploading(true)
      const res = await uploadAvatar(file)
      setUser({ ...user!, avatarUrl: res.data.avatarUrl })
      showToast('success', 'Avatar updated')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <h1 className="text-2xl font-semibold text-ink">Profile</h1>

      {/* Personal Information */}
      <Card variant="default" className="p-6">
        <h2 className="text-lg font-medium text-ink mb-6">Personal Information</h2>

        <div className="flex items-center gap-6 mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative shrink-0 group"
            aria-label="Change avatar"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center text-2xl font-medium text-ink-muted">
                {user?.name ? getInitials(user.name) : '?'}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Upload avatar"
          />
          {uploading && <span className="text-sm text-ink-muted">Uploading...</span>}
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" type="tel" placeholder="Optional" error={errors.phone?.message} {...register('phone')} />
          <div>
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
              maxLength={500}
              error={errors.bio?.message}
              {...register('bio')}
            />
            <p className="mt-1 text-xs text-ink-muted text-right">
              {(bioValue ?? '').length}/500
            </p>
          </div>
          {user?.role === 'employer' && (
            <Input label="Company Name" placeholder="Company name" error={errors.companyName?.message} {...register('companyName')} />
          )}
          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security */}
      <Card variant="default" className="p-6">
        <h2 className="text-lg font-medium text-ink mb-6">Security</h2>

        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" disabled={isSubmittingPassword}>
              {isSubmittingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
