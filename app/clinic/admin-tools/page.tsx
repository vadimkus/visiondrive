'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

const ROLE_OPTIONS = [
  { value: 'CUSTOMER_ADMIN', label: 'Admin' },
  { value: 'CUSTOMER_OPS', label: 'Operator' },
  { value: 'CUSTOMER_ANALYST', label: 'Read-only analyst' },
  { value: 'USER', label: 'Basic user' },
] as const

type RoleOption = (typeof ROLE_OPTIONS)[number]['value']

type AdminUser = {
  id: string
  email: string
  name: string | null
  globalRole: string
  userStatus: string
  tenantRole: string
  membershipStatus: string
  createdAt: string
  updatedAt: string
}

type AdminStats = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  adminUsers: number
  patientCount: number
  appointmentCount: number
  completedVisitCount: number
  auditEventCount: number
}

type AdminResponse = {
  success: boolean
  error?: string
  tenant?: { id: string; name: string; slug: string; status: string }
  currentUser?: { id: string; email: string; role: string }
  stats?: AdminStats
  users?: AdminUser[]
}

type UserDraft = {
  name: string
  role: RoleOption
  password: string
}

type Copy = {
  title: string
  subtitle: string
  accessNote: string
  createTitle: string
  createHint: string
  email: string
  name: string
  role: string
  password: string
  passwordOptional: string
  createUser: string
  generatedPassword: string
  existingUserLinked: string
  usersTitle: string
  usersHint: string
  active: string
  inactive: string
  save: string
  resetPassword: string
  autoReset: string
  remove: string
  reactivate: string
  refresh: string
  loading: string
  noUsers: string
  confirmRemove: string
  adminOnly: string
  totalUsers: string
  activeUsers: string
  adminUsers: string
  patients: string
  appointments: string
  completedVisits: string
  auditEvents: string
  updated: string
  userCreated: string
  userUpdated: string
  passwordUpdated: string
  userAccessRemoved: string
  loadFailed: string
  createFailed: string
  updateFailed: string
  resetFailed: string
  removeFailed: string
  practiceFallback: string
  emailPlaceholder: string
  namePlaceholder: string
  newPasswordPlaceholder: string
  you: string
  roles: Record<RoleOption, string>
}

const copyByLocale: Record<'en' | 'ru', Copy> = {
  en: {
    title: 'Admin tools',
    subtitle: 'Create users, remove access, reset passwords, and watch practice-level admin stats.',
    accessNote:
      'Visible only to admin roles. Removing a user deactivates practice access instead of hard-deleting history.',
    createTitle: 'Create or link user',
    createHint: 'If the email already exists, the user is linked to this practice and reactivated.',
    email: 'Email',
    name: 'Name',
    role: 'Role',
    password: 'Password',
    passwordOptional: 'Leave empty to auto-generate for a new user',
    createUser: 'Create user',
    generatedPassword: 'Generated password. Copy it now:',
    existingUserLinked: 'Existing user linked. Reset the password below if needed.',
    usersTitle: 'Practice users',
    usersHint: 'Manage tenant membership, role, and password reset.',
    active: 'Active',
    inactive: 'Inactive',
    save: 'Save',
    resetPassword: 'Reset password',
    autoReset: 'Auto-generate reset',
    remove: 'Remove',
    reactivate: 'Reactivate',
    refresh: 'Refresh',
    loading: 'Loading admin tools...',
    noUsers: 'No users yet.',
    confirmRemove: 'Remove this user from the practice? Their historical records stay intact.',
    adminOnly: 'Admin-only control surface',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    adminUsers: 'Admins',
    patients: 'Patients',
    appointments: 'Appointments',
    completedVisits: 'Completed visits',
    auditEvents: 'Audit events',
    updated: 'Updated',
    userCreated: 'User created.',
    userUpdated: 'User updated.',
    passwordUpdated: 'Password updated.',
    userAccessRemoved: 'User access removed.',
    loadFailed: 'Could not load admin tools',
    createFailed: 'Could not create user',
    updateFailed: 'Could not update user',
    resetFailed: 'Could not reset password',
    removeFailed: 'Could not remove user',
    practiceFallback: 'Practice',
    emailPlaceholder: 'doctor@example.com',
    namePlaceholder: 'Dr. Anna',
    newPasswordPlaceholder: 'New strong password',
    you: 'You',
    roles: {
      CUSTOMER_ADMIN: 'Admin',
      CUSTOMER_OPS: 'Operator',
      CUSTOMER_ANALYST: 'Read-only analyst',
      USER: 'Basic user',
    },
  },
  ru: {
    title: 'Инструменты администратора',
    subtitle:
      'Создавайте пользователей, закрывайте доступ, меняйте пароли и смотрите административную статистику практики.',
    accessNote:
      'Видно только администраторам. Удаление отключает доступ к практике, но не стирает историю.',
    createTitle: 'Создать или подключить пользователя',
    createHint: 'Если email уже существует, пользователь будет подключен к этой практике и активирован.',
    email: 'Email',
    name: 'Имя',
    role: 'Роль',
    password: 'Пароль',
    passwordOptional: 'Оставьте пустым, чтобы сгенерировать для нового пользователя',
    createUser: 'Создать пользователя',
    generatedPassword: 'Сгенерированный пароль. Скопируйте сейчас:',
    existingUserLinked: 'Существующий пользователь подключен. При необходимости сбросьте пароль ниже.',
    usersTitle: 'Пользователи практики',
    usersHint: 'Управляйте доступом, ролью и сбросом пароля.',
    active: 'Активен',
    inactive: 'Отключен',
    save: 'Сохранить',
    resetPassword: 'Сменить пароль',
    autoReset: 'Сгенерировать новый',
    remove: 'Удалить',
    reactivate: 'Активировать',
    refresh: 'Обновить',
    loading: 'Загружаем инструменты администратора...',
    noUsers: 'Пользователей пока нет.',
    confirmRemove: 'Удалить пользователя из практики? Исторические записи сохранятся.',
    adminOnly: 'Панель только для администратора',
    totalUsers: 'Всего пользователей',
    activeUsers: 'Активные',
    adminUsers: 'Администраторы',
    patients: 'Пациенты',
    appointments: 'Записи',
    completedVisits: 'Завершенные визиты',
    auditEvents: 'События аудита',
    updated: 'Обновлено',
    userCreated: 'Пользователь создан.',
    userUpdated: 'Пользователь обновлен.',
    passwordUpdated: 'Пароль обновлен.',
    userAccessRemoved: 'Доступ пользователя закрыт.',
    loadFailed: 'Не удалось загрузить инструменты администратора',
    createFailed: 'Не удалось создать пользователя',
    updateFailed: 'Не удалось обновить пользователя',
    resetFailed: 'Не удалось сменить пароль',
    removeFailed: 'Не удалось удалить пользователя',
    practiceFallback: 'Практика',
    emailPlaceholder: 'doctor@example.com',
    namePlaceholder: 'Доктор Анна',
    newPasswordPlaceholder: 'Новый надежный пароль',
    you: 'Вы',
    roles: {
      CUSTOMER_ADMIN: 'Администратор',
      CUSTOMER_OPS: 'Оператор',
      CUSTOMER_ANALYST: 'Только просмотр',
      USER: 'Базовый пользователь',
    },
  },
}

function roleLabel(role: string, labels: Record<RoleOption, string>) {
  return isRoleOption(role) ? labels[role] : role
}

function isRoleOption(role: string): role is RoleOption {
  return ROLE_OPTIONS.some((option) => option.value === role)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ClinicAdminToolsPage() {
  const router = useRouter()
  const { locale } = useClinicLocale()
  const c = copyByLocale[locale]
  const apiError = useCallback(
    (message: unknown, fallback: string) =>
      locale === 'ru' ? fallback : typeof message === 'string' && message ? message : fallback,
    [locale]
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({})
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    role: 'CUSTOMER_OPS' as RoleOption,
    password: '',
  })

  const statCards = useMemo(
    () => [
      { label: c.totalUsers, value: stats?.totalUsers ?? 0 },
      { label: c.activeUsers, value: stats?.activeUsers ?? 0 },
      { label: c.adminUsers, value: stats?.adminUsers ?? 0 },
      { label: c.patients, value: stats?.patientCount ?? 0 },
      { label: c.appointments, value: stats?.appointmentCount ?? 0 },
      { label: c.completedVisits, value: stats?.completedVisitCount ?? 0 },
      { label: c.auditEvents, value: stats?.auditEventCount ?? 0 },
    ],
    [c, stats]
  )

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch('/api/clinic/admin/users', { credentials: 'include' })
    const json = (await res.json().catch(() => ({}))) as AdminResponse

    if (res.status === 401) {
      router.push('/login')
      return
    }
    if (res.status === 403) {
      router.push('/clinic')
      return
    }
    if (!res.ok || !json.success) {
      setError(apiError(json.error, c.loadFailed))
      return
    }

    const loadedUsers = json.users || []
    setUsers(loadedUsers)
    setStats(json.stats || null)
    setTenantName(json.tenant?.name || '')
    setCurrentUserId(json.currentUser?.id || '')
    setDrafts(
      loadedUsers.reduce<Record<string, UserDraft>>((acc, user) => {
        acc[user.id] = {
          name: user.name || '',
          role: isRoleOption(user.tenantRole) ? user.tenantRole : 'CUSTOMER_OPS',
          password: '',
        }
        return acc
      }, {})
    )
  }, [apiError, c.loadFailed, router])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      load().finally(() => setLoading(false))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [load])

  const setDraft = (userId: string, patch: Partial<UserDraft>) => {
    setDrafts((current) => ({
      ...current,
      [userId]: { ...(current[userId] || { name: '', role: 'CUSTOMER_OPS', password: '' }), ...patch },
    }))
  }

  const createUser = async () => {
    setSaving('create')
    setError(null)
    setNotice(null)
    setCreatedPassword(null)
    setResetPassword(null)

    const res = await fetch('/api/clinic/admin/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: createForm.email,
        name: createForm.name,
        role: createForm.role,
        password: createForm.password || undefined,
      }),
    })
    const json = await res.json().catch(() => ({}))
    setSaving(null)

    if (!res.ok || !json.success) {
      setError(apiError(json.error, c.createFailed))
      return
    }

    setCreateForm({ email: '', name: '', role: 'CUSTOMER_OPS', password: '' })
    setCreatedPassword(json.generatedPassword || null)
    setNotice(json.linkedExistingUser ? c.existingUserLinked : c.userCreated)
    await load()
  }

  const saveUser = async (user: AdminUser, membershipStatus?: 'ACTIVE' | 'INACTIVE') => {
    const draft = drafts[user.id]
    if (!draft) return

    setSaving(`save:${user.id}`)
    setError(null)
    setNotice(null)
    setResetPassword(null)

    const res = await fetch(`/api/clinic/admin/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: draft.name,
        role: draft.role,
        ...(membershipStatus ? { membershipStatus } : {}),
      }),
    })
    const json = await res.json().catch(() => ({}))
    setSaving(null)

    if (!res.ok || !json.success) {
      setError(apiError(json.error, c.updateFailed))
      return
    }

    setNotice(c.userUpdated)
    await load()
  }

  const changePassword = async (user: AdminUser, autoGeneratePassword: boolean) => {
    const draft = drafts[user.id]
    setSaving(`password:${user.id}`)
    setError(null)
    setNotice(null)
    setResetPassword(null)

    const res = await fetch(`/api/clinic/admin/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        newPassword: autoGeneratePassword ? undefined : draft?.password,
        autoGeneratePassword,
      }),
    })
    const json = await res.json().catch(() => ({}))
    setSaving(null)

    if (!res.ok || !json.success) {
      setError(apiError(json.error, c.resetFailed))
      return
    }

    setDraft(user.id, { password: '' })
    setResetPassword(json.generatedPassword || null)
    setNotice(c.passwordUpdated)
  }

  const removeUser = async (user: AdminUser) => {
    if (!window.confirm(c.confirmRemove)) return

    setSaving(`remove:${user.id}`)
    setError(null)
    setNotice(null)
    setResetPassword(null)

    const res = await fetch(`/api/clinic/admin/users/${user.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    setSaving(null)

    if (!res.ok || !json.success) {
      setError(apiError(json.error, c.removeFailed))
      return
    }

    setNotice(c.userAccessRemoved)
    await load()
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-5xl items-center justify-center">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" aria-hidden />
          <p className="mt-3 text-sm font-medium text-slate-600">{c.loading}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-orange-100">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              {c.adminOnly}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{c.subtitle}</p>
            <p className="mt-4 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-300">
              {c.accessNote}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {tenantName || c.practiceFallback}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {statCards.slice(0, 4).map((card) => (
                <div key={card.label} className="rounded-2xl bg-white/10 p-3">
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-300">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {(error || notice || createdPassword || resetPassword) && (
        <section className="space-y-3">
          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
              <p>{error}</p>
            </div>
          )}
          {notice && (
            <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <p>{notice}</p>
            </div>
          )}
          {(createdPassword || resetPassword) && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">{c.generatedPassword}</p>
              <p className="mt-2 select-all break-all font-mono text-sm font-bold text-amber-800">
                {createdPassword || resetPassword}
              </p>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <UserPlus className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">{c.createTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{c.createHint}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{c.email}</span>
              <input
                value={createForm.email}
                onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))}
                placeholder={c.emailPlaceholder}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{c.name}</span>
              <input
                value={createForm.name}
                onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))}
                placeholder={c.namePlaceholder}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{c.role}</span>
              <select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((form) => ({
                    ...form,
                    role: isRoleOption(event.target.value) ? event.target.value : 'CUSTOMER_OPS',
                  }))
                }
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {c.roles[option.value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{c.password}</span>
              <input
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))}
                placeholder={c.passwordOptional}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <button
              type="button"
              onClick={createUser}
              disabled={saving === 'create'}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === 'create' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
              {c.createUser}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {statCards.slice(3).map((card) => (
              <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-950">{card.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{card.label}</p>
              </div>
            ))}
          </div>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{c.usersTitle}</h2>
                  <p className="mt-1 text-sm text-slate-500">{c.usersHint}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={load}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                {c.refresh}
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {users.length === 0 && <p className="p-6 text-sm text-slate-500">{c.noUsers}</p>}
              {users.map((user) => {
                const draft = drafts[user.id] || { name: user.name || '', role: 'CUSTOMER_OPS', password: '' }
                const isActive = user.userStatus === 'ACTIVE' && user.membershipStatus === 'ACTIVE'
                const isSelf = user.id === currentUserId
                return (
                  <article key={user.id} className="p-5 sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-[1fr_12rem_15rem] lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-all text-base font-bold text-slate-950">{user.email}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isActive ? c.active : c.inactive}
                          </span>
                          {isSelf && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-800">
                              {c.you}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {roleLabel(user.tenantRole, c.roles)} · {c.updated} {formatDate(user.updatedAt)}
                        </p>
                      </div>

                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">{c.role}</span>
                        <select
                          value={draft.role}
                          onChange={(event) =>
                            setDraft(user.id, {
                              role: isRoleOption(event.target.value) ? event.target.value : 'CUSTOMER_OPS',
                            })
                          }
                          className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                          disabled={!isActive}
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {c.roles[option.value]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">{c.name}</span>
                        <input
                          value={draft.name}
                          onChange={(event) => setDraft(user.id, { name: event.target.value })}
                          className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                          disabled={!isActive}
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">{c.password}</span>
                        <input
                          type="password"
                          value={draft.password}
                          onChange={(event) => setDraft(user.id, { password: event.target.value })}
                          placeholder={c.newPasswordPlaceholder}
                          className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                          disabled={!isActive}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => saveUser(user)}
                        disabled={!isActive || saving === `save:${user.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving === `save:${user.id}` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : c.save}
                      </button>
                      <button
                        type="button"
                        onClick={() => changePassword(user, false)}
                        disabled={!isActive || !draft.password || saving === `password:${user.id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <KeyRound className="h-4 w-4" aria-hidden />
                        {c.resetPassword}
                      </button>
                      <button
                        type="button"
                        onClick={() => changePassword(user, true)}
                        disabled={!isActive || saving === `password:${user.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {c.autoReset}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => saveUser(user, 'ACTIVE')}
                          disabled={saving === `save:${user.id}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {c.reactivate}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeUser(user)}
                          disabled={isSelf || saving === `remove:${user.id}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          {c.remove}
                        </button>
                      )}
                      {user.globalRole === 'MASTER_ADMIN' && (
                        <span className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-700">
                          <ShieldAlert className="h-4 w-4" aria-hidden />
                          MASTER_ADMIN
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
