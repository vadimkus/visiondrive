'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Play, Save } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type Template = {
  id: string
  kind: string
  channel: string
  name: string
  body: string
  active: boolean
}

type Delivery = {
  id: string
  kind: string
  status: string
  scheduledFor: string
  preparedAt: string | null
  whatsappUrl: string | null
  error: string | null
  body: string
}

export default function ClinicRemindersPage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const copy = {
    title: isRu ? 'Напоминания' : 'Reminders',
    subtitle: isRu
      ? 'WhatsApp-шаблоны, подготовленные сообщения и ежедневная обработка напоминаний.'
      : 'WhatsApp templates, prepared messages, and the daily reminder runner.',
    templates: isRu ? 'Шаблоны' : 'Templates',
    deliveries: isRu ? 'Журнал отправок' : 'Delivery log',
    runDue: isRu ? 'Подготовить просроченные' : 'Prepare due reminders',
    saved: isRu ? 'Шаблоны сохранены.' : 'Templates saved.',
    prepared: isRu ? 'Напоминания подготовлены: {count}' : 'Prepared reminders: {count}',
    bodyHint: isRu
      ? 'Доступные переменные: {{firstName}}, {{lastName}}, {{service}}, {{date}}, {{time}}'
      : 'Available variables: {{firstName}}, {{lastName}}, {{service}}, {{date}}, {{time}}',
  }
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const [templates, setTemplates] = useState<Template[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [templateRes, deliveryRes] = await Promise.all([
        fetch('/api/clinic/reminders/templates', { credentials: 'include' }),
        fetch('/api/clinic/reminders/deliveries', { credentials: 'include' }),
      ])
      const templateData = await templateRes.json()
      const deliveryData = await deliveryRes.json()
      if (!templateRes.ok || !deliveryRes.ok) {
        setError(templateData.error || deliveryData.error || t.failedToLoad)
        return
      }
      setTemplates(templateData.templates || [])
      setDeliveries(deliveryData.deliveries || [])
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const saveTemplates = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/clinic/reminders/templates', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setTemplates(data.templates || [])
      setMessage(copy.saved)
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  const runDue = async () => {
    setRunning(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/clinic/reminders/run', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      setMessage(copy.prepared.replace('{count}', String(data.count || 0)))
      await load()
    } catch {
      setError(t.networkError)
    } finally {
      setRunning(false)
    }
  }

  if (loading) return <ClinicSpinner label={t.loading} />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 md:p-7 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
              {t.backDashboard}
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => void runDue()}
            disabled={running}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden />
            {running ? t.loading : copy.runDue}
          </button>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {message && <ClinicAlert variant="success">{message}</ClinicAlert>}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">{copy.templates}</h2>
              <p className="mt-1 text-xs text-gray-500">{copy.bodyHint}</p>
            </div>
            <button
              type="button"
              onClick={() => void saveTemplates()}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden />
              {saving ? t.savingEllipsis : t.save}
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {templates.map((template, index) => (
              <div key={template.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    {template.kind.replaceAll('_', ' ')} · {template.channel}
                  </p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <input
                      type="checkbox"
                      checked={template.active}
                      onChange={(e) =>
                        setTemplates((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, active: e.target.checked } : item
                          )
                        )
                      }
                    />
                    {template.active ? t.statusActive : t.statusInactive}
                  </label>
                </div>
                <input
                  value={template.name}
                  onChange={(e) =>
                    setTemplates((current) =>
                      current.map((item, i) => (i === index ? { ...item, name: e.target.value } : item))
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900"
                />
                <textarea
                  rows={4}
                  value={template.body}
                  onChange={(e) =>
                    setTemplates((current) =>
                      current.map((item, i) => (i === index ? { ...item, body: e.target.value } : item))
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-semibold text-gray-900">{copy.deliveries}</h2>
          <div className="mt-4 space-y-3">
            {deliveries.length === 0 ? (
              <p className="text-sm text-gray-500">{t.noHistory}</p>
            ) : (
              deliveries.map((delivery) => (
                <div key={delivery.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {delivery.kind.replaceAll('_', ' ')}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {delivery.status} ·{' '}
                        {new Date(delivery.scheduledFor).toLocaleString(dateLocale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    {delivery.whatsappUrl && (
                      <a
                        href={delivery.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-700">{delivery.body}</p>
                  {delivery.error && <p className="mt-2 text-xs text-red-700">{delivery.error}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
