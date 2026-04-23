'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type MeResponse = {
  user: { id: string; email: string; name: string | null; role: string }
  tenant: { id: string; name: string; slug: string }
}

export default function ClinicAccountPage() {
  const router = useRouter()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/clinic/me', { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load')
          return
        }
        if (!cancelled) {
          setMe(data)
          setName(data.user?.name ?? '')
        }
      } catch {
        setError('Network error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSavingProfile(true)
    try {
      const res = await fetch('/api/clinic/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        return
      }
      setMessage('Profile updated')
      setError('')
    } catch {
      setError('Network error')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSavingPassword(true)
    try {
      const res = await fetch('/api/clinic/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not update password')
        return
      }
      setMessage('Password updated')
      setError('')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      setError('Network error')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error && !me) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <p className="text-red-600">{error}</p>
        <Link href="/clinic" className="text-orange-600 text-sm">
          ← Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <Link href="/clinic" className="text-sm text-orange-600 hover:text-orange-700">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Your account</h1>
        <p className="text-gray-600 text-sm mt-1">
          Signed in as <span className="font-medium text-gray-800">{me?.user.email}</span>
        </p>
        <p className="text-gray-500 text-sm mt-0.5">
          Practice: <span className="font-medium text-gray-700">{me?.tenant.name}</span>
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-100">
          {message}
        </div>
      )}
      {error && me && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Display name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 outline-none text-base"
            autoComplete="name"
          />
        </div>
        <button
          type="submit"
          disabled={savingProfile}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
        >
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={savePassword} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        <p className="text-sm text-gray-500">
          Use a strong password. You will stay signed in on this device after changing it.
        </p>
        <div>
          <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
            Current password
          </label>
          <div className="relative">
            <input
              id="current"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/30 outline-none text-base"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"
              aria-label="Toggle visibility"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="newpw" className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              id="newpw"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/30 outline-none text-base"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"
              aria-label="Toggle visibility"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={savingPassword || !currentPassword || !newPassword}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {savingPassword ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
