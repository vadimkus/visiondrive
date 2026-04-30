'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Logo from '@/app/components/common/Logo'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { usePublicDocumentTitle } from '@/app/hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'Login - VisionDrive Practice OS',
    home: 'VisionDrive home',
    access: 'Access',
    workspace: 'Workspace',
    productLabel: 'Practice OS',
    signIn: 'Sign in',
    email: 'Email',
    emailPlaceholder: 'name@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    remember: 'Remember me',
    needAccess: 'Need access?',
    signingIn: 'Signing in...',
    openWorkspace: 'Open workspace',
    missingFields: 'Please enter both email and password',
    invalidCredentials: 'Invalid credentials',
    connectionError: 'Connection error. Please try again.',
    footer: 'Practice OS',
  },
  ru: {
    documentTitle: 'Вход - VisionDrive Practice OS',
    home: 'На главную VisionDrive',
    access: 'Доступ',
    workspace: 'Кабинет',
    productLabel: 'Кабинет практики',
    signIn: 'Вход',
    email: 'Почта',
    emailPlaceholder: 'name@example.com',
    password: 'Пароль',
    passwordPlaceholder: 'Введите пароль',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
    remember: 'Запомнить меня',
    needAccess: 'Нужен доступ?',
    signingIn: 'Входим...',
    openWorkspace: 'Открыть кабинет',
    missingFields: 'Введите email и пароль',
    invalidCredentials: 'Неверные данные для входа',
    connectionError: 'Ошибка соединения. Попробуйте снова.',
    footer: 'Practice OS',
  },
} as const

export default function LoginPage() {
  const router = useRouter()
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.email || !formData.password) {
        setError(t.missingFields)
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          portal: 'clinic',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(publicLanguage === 'ru' ? t.invalidCredentials : data.error || t.invalidCredentials)
        setLoading(false)
        return
      }

      router.push('/clinic')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError(t.connectionError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-slate-950 md:bg-[#f5f5f7]">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 py-8 md:max-w-[440px] md:px-6">
        <div className="mb-7 flex items-center justify-between">
          <Link href="/" className="flex min-h-11 items-center gap-3" aria-label={t.home}>
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
              <Logo className="h-9 w-9" priority />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight">
                Vision<span className="text-orange-500">Drive</span>
              </span>
              <span className="block text-xs text-slate-500">{t.productLabel}</span>
            </span>
          </Link>
          <Link href="/contact" className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 active:bg-slate-100">
            {t.access}
          </Link>
        </div>

        <div className="md:rounded-[2rem] md:bg-white md:p-8 md:shadow-xl md:shadow-slate-200/70">
          <div className="mb-7">
            <p className="text-sm font-semibold text-orange-600">{t.workspace}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
              {t.signIn}
            </h1>
          </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t.email}
                </label>
                <input
                  type="text"
                  id="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="email"
                  className="
                    w-full px-4 py-4 md:py-3.5
                    bg-slate-50 md:bg-slate-100/80 border-0
                    rounded-2xl
                    text-slate-950 text-[17px] md:text-[16px]
                    placeholder:text-slate-400
                    focus:bg-white focus:ring-2 focus:ring-orange-500/50
                    transition-all duration-200
                    outline-none
                  "
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    className="
                      w-full px-4 py-4 md:py-3.5 pr-14
                      bg-slate-50 md:bg-slate-100/80 border-0
                      rounded-2xl
                      text-slate-950 text-[17px] md:text-[16px]
                      placeholder:text-slate-400
                      focus:bg-white focus:ring-2 focus:ring-orange-500/50
                      transition-all duration-200
                      outline-none
                    "
                    placeholder={t.passwordPlaceholder}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-2 top-1/2 -translate-y-1/2
                      p-2.5 rounded-xl
                      text-slate-400 hover:text-slate-600
                      active:bg-slate-200
                      transition-colors
                    "
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="
                      w-6 h-6 rounded-lg border-2 border-slate-300
                      peer-checked:bg-orange-500 peer-checked:border-orange-500
                      transition-all duration-200
                      flex items-center justify-center
                    ">
                      <svg 
                        className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path 
                          d="M2 6l3 3 5-6" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    {t.remember}
                  </span>
                </label>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
                >
                  {t.needAccess}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-4 mt-3
                  bg-orange-500 hover:bg-orange-600
                  active:scale-[0.98]
                  text-white font-semibold text-[17px] md:text-[16px]
                  rounded-2xl
                  shadow-lg shadow-orange-500/30
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                  flex items-center justify-center gap-2
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.signingIn}
                  </>
                ) : (
                  t.openWorkspace
                )}
              </button>
            </form>
        </div>
      </div>
      <footer className="px-5 pb-6 text-center text-xs text-slate-400">
        {t.footer} · © {new Date().getFullYear()} VisionDrive
      </footer>
    </div>
  )
}
