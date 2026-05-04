'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarCheck,
  Copy,
  ExternalLink,
  Instagram,
  Link as LinkIcon,
  MessageCircle,
  Package,
  RefreshCw,
  Repeat,
  Sparkles,
  UserPlus,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type LeadStage =
  | 'NEW'
  | 'REPLIED'
  | 'BOOKING_LINK_SENT'
  | 'BOOKED'
  | 'COMPLETED'
  | 'REBOOKING_DUE'
  | 'PACKAGE_OPPORTUNITY'
  | 'MEMBERSHIP_OPPORTUNITY'
  | 'LOST'

type Procedure = {
  id: string
  name: string
  basePriceCents: number
  currency: string
}
type Lead = {
  id: string
  source: string
  stage: LeadStage
  displayName: string
  instagramHandle: string | null
  phone: string | null
  email: string | null
  campaign: string | null
  trackingCode: string
  notes: string | null
  createdAt: string
  updatedAt: string
  lastContactedAt: string | null
  convertedAt: string | null
  lostAt: string | null
  procedure: Procedure | null
  convertedPatient: { id: string; firstName: string; lastName: string; phone: string | null } | null
  convertedAppointment: {
    id: string
    startsAt: string
    status: string
    completedAt: string | null
    procedure: { id: string; name: string } | null
  } | null
  activities: Array<{
    id: string
    type: string
    direction: string
    body: string | null
    occurredAt: string
  }>
}

type GrowthOverview = {
  booking: {
    enabled: boolean
    confirmationMode: 'REQUEST' | 'INSTANT'
    bookingUrl: string | null
    practiceName: string | null
  }
  summary: {
    leadsCreated: number
    activeLeads: number
    bookedLeads: number
    completedLeads: number
    bookingConversionRatePct: number
    rebookingFollowUps: number
    packagesSold: number
    membershipPlans: number
    activeMemberships: number
  }
  stageSummary: Array<{ stage: LeadStage; label: string; count: number }>
  tasks: Array<{ id: string; kind: string; title: string; detail: string; actionHref: string }>
  leads: Lead[]
  procedures: Procedure[]
}

const copy = {
  en: {
    title: 'Instagram Growth Pipeline',
    badge: 'Lead to rebooking',
    intro:
      'Capture Instagram leads, prepare reviewed DM replies, send tracked booking links, and move each client toward aftercare, rebooking, packages, and memberships.',
    refresh: 'Refresh',
    createLead: 'Create lead',
    handle: 'Instagram handle',
    name: 'Name',
    service: 'Interested service',
    campaign: 'Campaign',
    initialMessage: 'DM note',
    noService: 'No service yet',
    saveLead: 'Save lead',
    newLead: 'New lead',
    replied: 'Replied',
    bookingLinkSent: 'Booking link sent',
    booked: 'Booked',
    completed: 'Completed',
    rebookingDue: 'Rebooking due',
    packageOpportunity: 'Package opportunity',
    membershipOpportunity: 'Membership opportunity',
    lost: 'Lost',
    generatedMessage: 'Generated message',
    prepareBooking: 'Prepare booking link',
    priceReply: 'Price reply',
    markReplied: 'Mark replied',
    markLost: 'Mark lost',
    packageOffer: 'Package offer',
    membershipOffer: 'Membership offer',
    openInstagram: 'Open Instagram',
    openAppointment: 'Open appointment',
    openPatient: 'Open patient',
    copyMessage: 'Copy message',
    copied: 'Copied',
    noLeads: 'No leads in this stage yet.',
    bookingOff:
      'Public booking is off. You can still prepare copy, but turn booking on from the dashboard before sharing links.',
    loadFailed: 'Could not load growth pipeline.',
    saveFailed: 'Could not save lead.',
    actionFailed: 'Action failed.',
    tasks: 'Today’s growth tasks',
    noTasks: 'No growth tasks right now.',
  },
  ru: {
    title: 'Instagram Growth Pipeline',
    badge: 'От лида до повторной записи',
    intro:
      'Фиксируйте Instagram-лиды, готовьте DM-ответы, отправляйте отслеживаемые ссылки записи и ведите клиента к aftercare, повторной записи, пакетам и membership.',
    refresh: 'Обновить',
    createLead: 'Создать лид',
    handle: 'Instagram handle',
    name: 'Имя',
    service: 'Интересующая услуга',
    campaign: 'Кампания',
    initialMessage: 'Комментарий из DM',
    noService: 'Услуга не выбрана',
    saveLead: 'Сохранить лид',
    newLead: 'Новый лид',
    replied: 'Ответ отправлен',
    bookingLinkSent: 'Ссылка отправлена',
    booked: 'Записан',
    completed: 'Визит завершён',
    rebookingDue: 'Нужна повторная запись',
    packageOpportunity: 'Можно предложить пакет',
    membershipOpportunity: 'Можно предложить membership',
    lost: 'Потерян',
    generatedMessage: 'Готовый текст',
    prepareBooking: 'Подготовить ссылку',
    priceReply: 'Ответ по цене',
    markReplied: 'Отметить ответ',
    markLost: 'Потерян',
    packageOffer: 'Пакет',
    membershipOffer: 'Membership',
    openInstagram: 'Открыть Instagram',
    openAppointment: 'Открыть запись',
    openPatient: 'Открыть клиента',
    copyMessage: 'Скопировать',
    copied: 'Скопировано',
    noLeads: 'В этой колонке пока нет лидов.',
    bookingOff:
      'Публичная запись выключена. Текст можно готовить, но перед отправкой ссылок включите booking на dashboard.',
    loadFailed: 'Не удалось загрузить growth pipeline.',
    saveFailed: 'Не удалось сохранить лид.',
    actionFailed: 'Действие не выполнено.',
    tasks: 'Growth-задачи на сегодня',
    noTasks: 'Сейчас нет growth-задач.',
  },
} as const

type GrowthCopy = (typeof copy)[keyof typeof copy]

const STAGE_ORDER: LeadStage[] = [
  'NEW',
  'REPLIED',
  'BOOKING_LINK_SENT',
  'BOOKED',
  'COMPLETED',
  'REBOOKING_DUE',
  'PACKAGE_OPPORTUNITY',
  'MEMBERSHIP_OPPORTUNITY',
  'LOST',
]

function stageLabel(stage: LeadStage, c: GrowthCopy) {
  const labels: Record<LeadStage, string> = {
    NEW: c.newLead,
    REPLIED: c.replied,
    BOOKING_LINK_SENT: c.bookingLinkSent,
    BOOKED: c.booked,
    COMPLETED: c.completed,
    REBOOKING_DUE: c.rebookingDue,
    PACKAGE_OPPORTUNITY: c.packageOpportunity,
    MEMBERSHIP_OPPORTUNITY: c.membershipOpportunity,
    LOST: c.lost,
  }
  return labels[stage]
}

function instagramHref(handle: string | null) {
  return handle ? `https://www.instagram.com/${handle.replace(/^@+/, '')}/` : null
}

export default function ClinicGrowthPage() {
  const { locale } = useClinicLocale()
  const c = copy[locale]
  const [data, setData] = useState<GrowthOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [generated, setGenerated] = useState<{ leadId: string; message: string; bookingUrl?: string } | null>(null)
  const [form, setForm] = useState({
    instagramHandle: '',
    displayName: '',
    procedureId: '',
    campaign: 'instagram_dm',
    initialMessage: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/growth/overview', { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.loadFailed)
        return
      }
      setData(json)
    } catch {
      setError(c.loadFailed)
    } finally {
      setLoading(false)
    }
  }, [c.loadFailed])

  useEffect(() => {
    void load()
  }, [load])

  const leadsByStage = useMemo(() => {
    const map = new Map<LeadStage, Lead[]>()
    for (const stage of STAGE_ORDER) map.set(stage, [])
    for (const lead of data?.leads ?? []) {
      map.get(lead.stage)?.push(lead)
    }
    return map
  }, [data?.leads])

  async function createLead(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'INSTAGRAM',
          instagramHandle: form.instagramHandle,
          displayName: form.displayName,
          procedureId: form.procedureId || null,
          campaign: form.campaign,
          initialMessage: form.initialMessage,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.saveFailed)
        return
      }
      setForm({ instagramHandle: '', displayName: '', procedureId: '', campaign: 'instagram_dm', initialMessage: '' })
      await load()
    } catch {
      setError(c.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  async function leadAction(lead: Lead, action: string, extra: Record<string, unknown> = {}) {
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/leads/${lead.id}/actions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, locale, ...extra }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.actionFailed)
        return
      }
      if (json.message) {
        setGenerated({ leadId: lead.id, message: json.message, bookingUrl: json.bookingUrl })
      }
      await load()
    } catch {
      setError(c.actionFailed)
    }
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value)
    setNotice(c.copied)
    window.setTimeout(() => setNotice(''), 1500)
  }

  if (loading && !data) return <ClinicSpinner label={c.title} />

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      <header className="overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-orange-50 p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-800">
              <Instagram className="h-3.5 w-3.5" />
              {c.badge}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{c.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">{c.intro}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {c.refresh}
          </button>
        </div>
      </header>

      {data?.booking.enabled === false && <ClinicAlert variant="warning">{c.bookingOff}</ClinicAlert>}
      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {notice && <ClinicAlert variant="success">{notice}</ClinicAlert>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={UserPlus} label={c.newLead} value={data?.summary.leadsCreated ?? 0} />
        <Metric icon={CalendarCheck} label={c.booked} value={data?.summary.bookedLeads ?? 0} />
        <Metric icon={Sparkles} label={c.completed} value={data?.summary.completedLeads ?? 0} />
        <Metric icon={Repeat} label={c.rebookingDue} value={data?.summary.rebookingFollowUps ?? 0} />
        <Metric icon={Package} label={c.packageOpportunity} value={data?.summary.packagesSold ?? 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form onSubmit={createLead} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-950">{c.createLead}</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Field label={c.handle}>
              <input
                value={form.instagramHandle}
                onChange={(event) => setForm((current) => ({ ...current, instagramHandle: event.target.value }))}
                placeholder="@client"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </Field>
            <Field label={c.name}>
              <input
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </Field>
            <Field label={c.service}>
              <select
                value={form.procedureId}
                onChange={(event) => setForm((current) => ({ ...current, procedureId: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
              >
                <option value="">{c.noService}</option>
                {(data?.procedures ?? []).map((procedure) => (
                  <option key={procedure.id} value={procedure.id}>
                    {procedure.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={c.campaign}>
              <input
                value={form.campaign}
                onChange={(event) => setForm((current) => ({ ...current, campaign: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </Field>
            <Field label={c.initialMessage}>
              <textarea
                value={form.initialMessage}
                onChange={(event) => setForm((current) => ({ ...current, initialMessage: event.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {c.saveLead}
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{c.tasks}</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {(data?.tasks.length ?? 0) > 0 ? (
              data?.tasks.slice(0, 6).map((task) => (
                <Link
                  key={task.id}
                  href={task.actionHref}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-sm hover:border-pink-200 hover:bg-pink-50"
                >
                  <p className="font-semibold text-gray-950">{task.title}</p>
                  <p className="mt-1 text-gray-500">{task.detail}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500">{c.noTasks}</p>
            )}
          </div>
          {generated && (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{c.generatedMessage}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-900">{generated.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(generated.message)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-emerald-800"
                >
                  <Copy className="h-4 w-4" />
                  {c.copyMessage}
                </button>
              </div>
            </div>
          )}
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {STAGE_ORDER.map((stage) => {
          const leads = leadsByStage.get(stage) ?? []
          return (
            <div key={stage} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-gray-950">{stageLabel(stage, c)}</h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{leads.length}</span>
              </div>
              <div className="mt-3 space-y-3">
                {leads.length === 0 && <p className="text-sm text-gray-500">{c.noLeads}</p>}
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    c={c}
                    onAction={(action, extra) => void leadAction(lead, action, extra)}
                    onCopy={copyText}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-pink-600" />
      <p className="mt-3 text-2xl font-semibold text-gray-950">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function LeadCard({
  lead,
  c,
  onAction,
  onCopy,
}: {
  lead: Lead
  c: GrowthCopy
  onAction: (action: string, extra?: Record<string, unknown>) => void
  onCopy: (value: string) => Promise<void>
}) {
  const href = instagramHref(lead.instagramHandle)
  const latestActivity = lead.activities?.[0]
  return (
    <article className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-950">{lead.displayName}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {lead.instagramHandle ? `@${lead.instagramHandle}` : 'Instagram'} {lead.procedure ? `· ${lead.procedure.name}` : ''}
          </p>
        </div>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white p-2 text-pink-700 hover:bg-pink-50"
            title={c.openInstagram}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      {lead.notes && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600">{lead.notes}</p>}
      {latestActivity?.body && (
        <p className="mt-2 line-clamp-3 rounded-xl bg-white p-2 text-xs leading-relaxed text-gray-600">
          {latestActivity.body}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAction('prepare_booking_link')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-pink-600 px-3 text-xs font-semibold text-white hover:bg-pink-700"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          {c.prepareBooking}
        </button>
        <button
          type="button"
          onClick={() => onAction('prepare_booking_link', { mode: 'price' })}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {c.priceReply}
        </button>
        <button
          type="button"
          onClick={() => onAction('mark_replied')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          {c.markReplied}
        </button>
        {lead.convertedAppointment && (
          <Link
            href={`/clinic/appointments/${lead.convertedAppointment.id}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            {c.openAppointment}
          </Link>
        )}
        {lead.convertedPatient && (
          <Link
            href={`/clinic/patients/${lead.convertedPatient.id}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            {c.openPatient}
          </Link>
        )}
        <button
          type="button"
          onClick={() => onAction('log_package_offer')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 text-xs font-semibold text-orange-700 hover:bg-orange-50"
        >
          <Package className="h-3.5 w-3.5" />
          {c.packageOffer}
        </button>
        <button
          type="button"
          onClick={() => onAction('log_membership_offer')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 text-xs font-semibold text-violet-700 hover:bg-violet-50"
        >
          <Repeat className="h-3.5 w-3.5" />
          {c.membershipOffer}
        </button>
        {latestActivity?.body && (
          <button
            type="button"
            onClick={() => void onCopy(latestActivity.body || '')}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {c.copyMessage}
          </button>
        )}
        <button
          type="button"
          onClick={() => onAction('mark_lost')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-3.5 w-3.5" />
          {c.markLost}
        </button>
      </div>
    </article>
  )
}
