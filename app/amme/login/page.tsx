'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/app/amme/components/LanguageSwitcher'
import { useI18n } from '@/app/amme/i18n'

export default function AmmeLoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = useState('tasha@amme.visiondrive.ae')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/amme/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || t('login.failed'))
        return
      }
      router.replace('/amme')
      router.refresh()
    } catch {
      setError(t('app.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="amme-login-wrap">
      <form className="amme-login-card" onSubmit={onSubmit}>
        <LanguageSwitcher />
        <div className="amme-eyebrow">VisionDrive · AMMÉ Bali</div>
        <h1>AMMÉ</h1>
        <p>{t('login.description')}</p>

        <div className="amme-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="amme-field">
          <label htmlFor="password">{t('login.password')}</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="amme-login-error">{error}</p>
        ) : null}

        <button className="amme-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? t('login.signingIn') : t('login.signIn')}
        </button>

        <p className="amme-login-footnote">
          {t('login.footnote')}
        </p>
      </form>
    </div>
  )
}
