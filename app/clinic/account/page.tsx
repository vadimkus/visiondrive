'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, PhoneCall } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { urlBase64ToUint8Array } from '@/lib/clinic/web-push-encoding'
import {
  CLINIC_ACCOUNT_NOTIFICATION_KEYS,
  DEFAULT_CLINIC_ACCOUNT_PREFERENCES,
  type ClinicAccountPreferences,
} from '@/lib/clinic/account-preferences'
import type { ClinicLocale } from '@/lib/clinic/strings'

type MeResponse = {
  user: { id: string; email: string; name: string | null; role: string }
  tenant: { id: string; name: string; slug: string }
  preferences: ClinicAccountPreferences
}

type PreferenceBoolKey = Exclude<keyof ClinicAccountPreferences, 'locale'>

export default function ClinicAccountPage() {
  const router = useRouter()
  const { locale, setLocale, t } = useClinicLocale()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [preferredLocale, setPreferredLocale] = useState<ClinicLocale>(locale)
  const [preferences, setPreferences] = useState<ClinicAccountPreferences>(
    DEFAULT_CLINIC_ACCOUNT_PREFERENCES
  )
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [pushConfigured, setPushConfigured] = useState(false)
  const [vapidPublic, setVapidPublic] = useState<string | null>(null)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)

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
          setError(data.error || t.failedToLoad)
          return
        }
        if (!cancelled) {
          setMe(data)
          setName(data.user?.name ?? '')
          const nextPrefs = data.preferences ?? DEFAULT_CLINIC_ACCOUNT_PREFERENCES
          setPreferences(nextPrefs)
          setPreferredLocale(nextPrefs.locale)
          setLocale(nextPrefs.locale)
        }
      } catch {
        setError(t.networkError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, setLocale, t.failedToLoad, t.networkError])

  useEffect(() => {
    if (!me) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/clinic/push/vapid-public', { credentials: 'include' })
        if (!r.ok || cancelled) return
        const j = await r.json()
        if (cancelled) return
        setPushConfigured(!!j.configured)
        setVapidPublic(typeof j.publicKey === 'string' ? j.publicKey : null)
        if (
          typeof window !== 'undefined' &&
          j.configured &&
          j.publicKey &&
          'serviceWorker' in navigator
        ) {
          const reg = await navigator.serviceWorker.register('/clinic-push-sw.js')
          await reg.update().catch(() => {})
          const sub = await reg.pushManager.getSubscription()
          if (!cancelled) setPushSubscribed(!!sub)
        } else if (!cancelled) {
          setPushSubscribed(false)
        }
      } catch {
        if (!cancelled) {
          setPushConfigured(false)
          setVapidPublic(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [me])

  const enablePush = async () => {
    setMessage('')
    setError('')
    if (!vapidPublic || !pushConfigured) {
      setError(t.pushNotConfigured)
      return
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setError(t.pushSubscribeFailed)
      return
    }
    setPushBusy(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setError(t.pushSubscribeFailed)
        return
      }
      const reg = await navigator.serviceWorker.register('/clinic-push-sw.js')
      await reg.update().catch(() => {})
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        const key = urlBase64ToUint8Array(vapidPublic)
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key as unknown as BufferSource,
        })
      }
      const json = sub.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setError(t.pushSubscribeFailed)
        return
      }
      const res = await fetch('/api/clinic/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error || t.pushSubscribeFailed)
        return
      }
      setPushSubscribed(true)
      setMessage(t.pushSubscribed)
    } catch {
      setError(t.pushSubscribeFailed)
    } finally {
      setPushBusy(false)
    }
  }

  const disablePush = async () => {
    setMessage('')
    setError('')
    setPushBusy(true)
    try {
      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.getRegistration('/clinic-push-sw.js'))
      const sub = reg ? await reg.pushManager.getSubscription() : null
      const endpoint = sub?.endpoint
      if (sub) {
        await sub.unsubscribe().catch(() => {})
      }
      if (endpoint) {
        await fetch('/api/clinic/push/subscribe', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        })
      }
      setPushSubscribed(false)
    } catch {
      setError(t.pushSubscribeFailed)
    } finally {
      setPushBusy(false)
    }
  }

  const setPreferredLanguage = (nextLocale: ClinicLocale) => {
    setPreferredLocale(nextLocale)
    setPreferences((current) => ({ ...current, locale: nextLocale }))
  }

  const updatePreference = (key: PreferenceBoolKey, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSavingProfile(true)
    try {
      const res = await fetch('/api/clinic/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, locale: preferredLocale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setMessage(t.profileUpdated)
      setError('')
      setLocale(preferredLocale)
    } catch {
      setError(t.networkError)
    } finally {
      setSavingProfile(false)
    }
  }

  const saveNotificationPreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setSavingPreferences(true)
    try {
      const res = await fetch('/api/clinic/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: { ...preferences, locale: preferredLocale } }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setMessage(t.notificationPreferencesUpdated)
      setError('')
    } catch {
      setError(t.networkError)
    } finally {
      setSavingPreferences(false)
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
        setError(data.error || t.couldNotUpdatePassword)
        return
      }
      setMessage(t.passwordUpdated)
      setError('')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      setError(t.networkError)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  if (error && !me) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <p className="text-red-600">{error}</p>
        <Link href="/clinic" className="text-orange-600 text-sm">
          {t.backDashboard}
        </Link>
      </div>
    )
  }

  const notificationPreferenceLabels: Record<
    (typeof CLINIC_ACCOUNT_NOTIFICATION_KEYS)[number],
    string
  > = {
    notifyNewBooking: t.inboxNewBooking,
    notifyCancelled: t.inboxCancelled,
    notifyRescheduled: t.inboxRescheduled,
    notifyReminderDue: t.inboxReminderDue,
    notifyReviewRequest: t.inboxReviewRequest,
    notifyUnpaidVisit: t.inboxUnpaidVisit,
    notifyLowStock: t.inboxLowStock,
    notifyPackageExpiry: t.packageExpiringSoon,
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/clinic" className="text-sm text-orange-600 hover:text-orange-700">
          {t.backDashboard}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.yourAccount}</h1>
        <p className="text-gray-600 text-sm mt-1">
          {t.signedInAs} <span className="font-medium text-gray-800">{me?.user.email}</span>
        </p>
        <p className="text-gray-500 text-sm mt-0.5">
          {t.practiceLabel} <span className="font-medium text-gray-700">{me?.tenant.name}</span>
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

      <section className="bg-orange-50 rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-orange-950">{t.soloPractitionerMode}</h2>
        <p className="mt-2 text-sm leading-relaxed text-orange-900">{t.soloPractitionerModeHint}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 border border-orange-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{t.practitioner}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{me?.user.name || me?.user.email}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-orange-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{t.assignmentMode}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{t.assignmentModeSolo}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
            <PhoneCall className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.phoneWorkflow}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.phoneWorkflowHint}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{t.phoneWorkflowStepCall}</p>
            <p className="mt-1 text-xs text-gray-500">{t.phoneWorkflowStepCallHint}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{t.phoneWorkflowStepLog}</p>
            <p className="mt-1 text-xs text-gray-500">{t.phoneWorkflowStepLogHint}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{t.phoneWorkflowStepFollowUp}</p>
            <p className="mt-1 text-xs text-gray-500">{t.phoneWorkflowStepFollowUpHint}</p>
          </div>
        </div>
      </section>

      <form
        onSubmit={saveNotificationPreferences}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t.notificationPreferencesHeading}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.notificationPreferencesHint}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
            <input
              type="checkbox"
              checked={preferences.notifyPush}
              onChange={(e) => updatePreference('notifyPush', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">{t.notifyByPush}</span>
              <span className="block text-xs text-gray-500">{t.notifyByPushHint}</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
            <input
              type="checkbox"
              checked={preferences.notifyEmail}
              onChange={(e) => updatePreference('notifyEmail', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">{t.notifyByEmail}</span>
              <span className="block text-xs text-gray-500">{t.notifyByEmailHint}</span>
            </span>
          </label>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">{t.notificationTypesHeading}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {CLINIC_ACCOUNT_NOTIFICATION_KEYS.map((key) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(e) => updatePreference(key, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                {notificationPreferenceLabels[key]}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t.pushDeviceHeading}</h3>
            <p className="text-sm text-gray-600">{t.pushNotificationsHint}</p>
          </div>
        {!pushConfigured && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            {t.pushNotConfigured}
          </p>
        )}
        {pushConfigured && pushSubscribed && (
          <p className="text-sm text-emerald-800">{t.pushSubscribed}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {pushConfigured && !pushSubscribed && (
            <button
              type="button"
              onClick={() => void enablePush()}
              disabled={pushBusy}
              className="min-h-11 px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {pushBusy ? t.savingEllipsis : t.pushEnable}
            </button>
          )}
          {pushConfigured && pushSubscribed && (
            <button
              type="button"
              onClick={() => void disablePush()}
              disabled={pushBusy}
              className="min-h-11 px-5 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold disabled:opacity-50"
            >
              {pushBusy ? t.savingEllipsis : t.pushDisable}
            </button>
          )}
        </div>
        </div>

        <button
          type="submit"
          disabled={savingPreferences}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
        >
          {savingPreferences ? t.savingEllipsis : t.saveNotificationPreferences}
        </button>
      </form>

      <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.profileHeading}</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t.displayName}
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 outline-none text-base"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="preferredLocale" className="block text-sm font-medium text-gray-700 mb-1">
            {t.preferredLanguage}
          </label>
          <select
            id="preferredLocale"
            value={preferredLocale}
            onChange={(e) => setPreferredLanguage(e.target.value === 'ru' ? 'ru' : 'en')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 outline-none text-base bg-white"
          >
            <option value="en">{t.localeEn}</option>
            <option value="ru">{t.localeRu}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">{t.preferredLanguageHint}</p>
        </div>
        <button
          type="submit"
          disabled={savingProfile}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
        >
          {savingProfile ? t.savingEllipsis : t.saveProfileBtn}
        </button>
      </form>

      <form onSubmit={savePassword} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.changePassword}</h2>
        <p className="text-sm text-gray-500">{t.passwordChangeHint}</p>
        <div>
          <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
            {t.currentPassword}
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
              aria-label={t.togglePasswordVisibility}
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="newpw" className="block text-sm font-medium text-gray-700 mb-1">
            {t.newPassword}
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
              aria-label={t.togglePasswordVisibility}
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
          {savingPassword ? t.updatingEllipsis : t.updatePasswordBtn}
        </button>
      </form>
    </div>
  )
}
