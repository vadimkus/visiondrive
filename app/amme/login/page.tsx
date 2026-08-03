'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AmmeLoginPage() {
  const router = useRouter()
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
        setError(data.error || 'Не удалось войти')
        return
      }
      router.replace('/amme')
      router.refresh()
    } catch {
      setError('Сеть недоступна')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="amme-login-wrap">
      <form className="amme-login-card" onSubmit={onSubmit}>
        <div className="amme-eyebrow">VisionDrive · AMMÉ</div>
        <h1>AMMÉ</h1>
        <p>Учёт гостей: баня и кухня. Вход для Таши.</p>

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
          <label htmlFor="password">Пароль</label>
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
          <p style={{ color: '#e0a47c', fontSize: 13, margin: '0 0 12px' }}>{error}</p>
        ) : null}

        <button className="amme-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
