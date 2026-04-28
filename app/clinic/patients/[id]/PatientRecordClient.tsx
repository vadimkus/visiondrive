'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  CreditCard,
  MessageSquare,
  Camera,
  Clock,
  Send,
  Pencil,
  ChevronUp,
  ClipboardList,
  FileDown,
  ImagePlus,
  PackageCheck,
  ShieldCheck,
  Trash2,
  Link2,
  Copy,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { anamnesisFromJson, anamnesisToStorage } from '@/lib/clinic/anamnesis'
import { patientDeleteConfirmation } from '@/lib/clinic/data-export'
import { buildTimelineItems, filterTimelineItems, type TimelineFilter } from '@/lib/clinic/timeline'
import { PATIENT_CATEGORIES, PATIENT_TAGS, type PatientCategory, type PatientTag } from '@/lib/clinic/patient-tags'
import { buildPriceQuoteMessage } from '@/lib/clinic/price-quotes'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'

type ProcedureRef = { id: string; name: string } | null

const PWA_SCRATCHPAD_DRAFT_KEY = 'clinic:pwa-offline-note-draft'
const OFFLINE_MEDIA_DB_NAME = 'clinic-offline-media-drafts'
const OFFLINE_MEDIA_STORE = 'mediaDrafts'

type OfflineVisitDraft = {
  patientId: string
  visitAt: string
  chiefComplaint: string
  procedureSummary: string
  nextSteps: string
  staffNotes: string
  treatmentPlanId: string
  aftercareTemplateId: string
  updatedAt: string
}

type OfflineMediaDraft = {
  id: string
  patientId: string
  visitId: string
  kind: string
  caption: string
  protocolChecked: PhotoProtocolItemId[]
  marketingConsent: boolean
  protocolNote: string
  protocolProcedureName: string | null
  fileName: string
  mimeType: string
  dataUrl: string
  createdAt: string
}

function defaultVisitDateTimeInput() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function openOfflineMediaDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(OFFLINE_MEDIA_DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(OFFLINE_MEDIA_STORE)) {
        db.createObjectStore(OFFLINE_MEDIA_STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readOfflineMediaDrafts(patientId: string) {
  const db = await openOfflineMediaDb()
  return new Promise<OfflineMediaDraft[]>((resolve, reject) => {
    const tx = db.transaction(OFFLINE_MEDIA_STORE, 'readonly')
    const request = tx.objectStore(OFFLINE_MEDIA_STORE).getAll()
    request.onsuccess = () => {
      const drafts = (request.result as OfflineMediaDraft[])
        .filter((draft) => draft.patientId === patientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      resolve(drafts)
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => db.close()
  })
}

async function saveOfflineMediaDraft(draft: OfflineMediaDraft) {
  const db = await openOfflineMediaDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OFFLINE_MEDIA_STORE, 'readwrite')
    tx.objectStore(OFFLINE_MEDIA_STORE).put(draft)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function deleteOfflineMediaDraft(id: string) {
  const db = await openOfflineMediaDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OFFLINE_MEDIA_STORE, 'readwrite')
    tx.objectStore(OFFLINE_MEDIA_STORE).delete(id)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

type AppointmentRow = {
  id: string
  startsAt: string
  endsAt: string | null
  status: string
  titleOverride: string | null
  internalNotes: string | null
  procedure: ProcedureRef
}

type MediaMeta = {
  id: string
  kind: string
  mimeType: string
  caption: string | null
  protocolJson: unknown | null
  marketingConsent: boolean
  marketingConsentAt: string | null
  visitId: string | null
  createdAt: string
}

type VisitRow = {
  id: string
  visitAt: string
  status: string
  chiefComplaint: string | null
  procedureSummary: string | null
  staffNotes: string | null
  nextSteps: string | null
  aftercareTemplateId: string | null
  aftercareTitleSnapshot: string | null
  aftercareTextSnapshot: string | null
  aftercareDocumentNameSnapshot: string | null
  aftercareDocumentUrlSnapshot: string | null
  aftercareSentAt: string | null
  media: MediaMeta[]
  appointment?: { id: string; startsAt: string; procedure: ProcedureRef } | null
  treatmentPlan?: { id: string; title: string; status: string } | null
  packageRedemptions?: PackageRedemptionRow[]
  giftCardRedemptions?: GiftCardRedemptionRow[]
}

type PaymentRow = {
  id: string
  amountCents: number
  discountCents: number
  discountRuleId: string | null
  discountName: string | null
  discountReason: string | null
  feeCents: number
  processorFeeCents: number
  currency: string
  method: string
  status: string
  reference: string | null
  note: string | null
  paidAt: string
  visitId: string | null
  createdAt: string
  correctionsAsOriginal?: PaymentCorrectionRow[]
}

type PaymentCorrectionRow = {
  id: string
  type: 'REFUND' | 'VOID'
  amountCents: number
  currency: string
  method: string
  reason: string
  note: string | null
  correctedAt: string
  adjustmentPaymentId: string | null
}

type ProductSaleRow = {
  id: string
  soldAt: string
  subtotalCents: number
  discountCents: number
  totalCents: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  note: string | null
  payment: { id: string; status: string; amountCents: number; processorFeeCents: number; method: string; paidAt: string } | null
  visit?: { id: string; visitAt: string } | null
  appointment?: { id: string; startsAt: string } | null
  lines: Array<{
    id: string
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
    stockItem: { id: string; name: string; sku: string | null; unit: string }
  }>
}

type PriceQuoteLineRow = {
  id: string
  procedureId: string | null
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
  procedure?: { id: string; name: string } | null
}

type PriceQuoteRow = {
  id: string
  quoteNumber: string
  title: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  currency: string
  subtotalCents: number
  discountCents: number
  totalCents: number
  validUntil: string | null
  note: string | null
  terms: string | null
  sentAt: string | null
  acceptedAt: string | null
  createdAt: string
  lines: PriceQuoteLineRow[]
}

type QuoteProcedureOption = {
  id: string
  name: string
  basePriceCents: number
  currency: string
  active: boolean
}

type PackageRedemptionRow = {
  id: string
  sessionsDelta: number
  note: string | null
  redeemedAt: string
  visit?: { id: string; visitAt: string } | null
  appointment?: { id: string; startsAt: string } | null
  patientPackage?: {
    id: string
    name: string
    totalSessions: number
    remainingSessions: number
  }
}

type GiftCardRedemptionRow = {
  id: string
  amountCents: number
  currency: string
  note: string | null
  redeemedAt: string
  giftCard: {
    id: string
    code: string
    buyerName: string
    recipientName: string | null
    remainingBalanceCents: number
  }
  payment?: { id: string; amountCents: number; currency: string; paidAt: string; reference: string | null } | null
}

type PackageRow = {
  id: string
  name: string
  totalSessions: number
  remainingSessions: number
  listPriceCents: number
  discountCents: number
  discountRuleId: string | null
  discountName: string | null
  discountReason: string | null
  priceCents: number
  currency: string
  status: 'ACTIVE' | 'USED_UP' | 'EXPIRED' | 'CANCELLED'
  purchasedAt: string
  expiresAt: string | null
  note: string | null
  procedure: ProcedureRef
  redemptions: PackageRedemptionRow[]
}

type DiscountRule = {
  id: string
  name: string
  type: 'PERCENT' | 'FIXED'
  percentBps: number
  fixedCents: number
  active: boolean
}

type AftercareTemplateRow = {
  id: string
  title: string
  messageBody: string
  documentName: string | null
  documentUrl: string | null
  active: boolean
  procedure: ProcedureRef
}

type ConsentTemplateRow = {
  id: string
  title: string
  body: string
  contraindications: string[]
  aftercareText: string | null
  active: boolean
  procedure: ProcedureRef
}

type ConsentRecordRow = {
  id: string
  templateTitleSnapshot: string
  templateBodySnapshot: string
  contraindicationsSnapshot: string[]
  checkedItems: string[]
  patientNameSnapshot: string
  accepted: boolean
  acceptedAt: string | null
  signatureText: string | null
  aftercareAcknowledged: boolean
  note: string | null
  createdAt: string
  procedure: ProcedureRef
  visit?: { id: string; visitAt: string } | null
  appointment?: { id: string; startsAt: string } | null
  template?: { id: string; title: string; active: boolean } | null
}

type TreatmentPlanMilestone = {
  title: string
  targetSession?: number | null
  note?: string | null
}

type TreatmentPlanRow = {
  id: string
  title: string
  expectedSessions: number
  cadenceDays: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  targetStartAt: string | null
  targetEndAt: string | null
  goals: string | null
  nextSteps: string | null
  outcomeNotes: string | null
  photoMilestones: TreatmentPlanMilestone[] | null
  createdAt: string
  updatedAt: string
  procedure: ProcedureRef
  visits: Array<{
    id: string
    visitAt: string
    status: string
    procedureSummary: string | null
    nextSteps: string | null
    media: Array<{ id: string; kind: string; caption: string | null; createdAt: string }>
  }>
}

type PortalLinkRow = {
  id: string
  tokenLastFour: string
  expiresAt: string
  revokedAt: string | null
  lastAccessedAt: string | null
  createdAt: string
}

type PortalRequestRow = {
  id: string
  type: 'RESCHEDULE' | 'CANCEL' | 'MESSAGE'
  status: 'OPEN' | 'REVIEWED' | 'CLOSED'
  message: string
  preferredTime: string | null
  createdAt: string
  appointment?: {
    id: string
    startsAt: string
    titleOverride: string | null
    procedure: { name: string } | null
  } | null
}

type ClientBalance = {
  currency: string
  expectedCents: number
  paidCents: number
  refundedCents: number
  pendingCents: number
  dueCents: number
  creditCents: number
  status: 'CLEAR' | 'DEBT' | 'CREDIT'
}

type CrmRow = {
  id: string
  type: string
  body: string
  occurredAt: string
  createdAt: string
}

type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type BrowserSpeechRecognitionEvent = {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      0: { transcript: string }
    }
  }
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

export type PatientRecord = {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  phone: string | null
  email: string | null
  homeAddress: string | null
  area: string | null
  accessNotes: string | null
  category: PatientCategory | null
  tags: PatientTag[]
  referredByName: string | null
  referralNote: string | null
  internalNotes: string | null
  anamnesisJson?: unknown | null
  appointments: AppointmentRow[]
  visits: VisitRow[]
  media: MediaMeta[]
  payments: PaymentRow[]
  priceQuotes: PriceQuoteRow[]
  productSales: ProductSaleRow[]
  packages: PackageRow[]
  giftCardRedemptions: GiftCardRedemptionRow[]
  consentRecords: ConsentRecordRow[]
  treatmentPlans: TreatmentPlanRow[]
  portalLinks: PortalLinkRow[]
  portalRequests: PortalRequestRow[]
  clientBalance: ClientBalance
  crmActivities: CrmRow[]
}

type Tab = 'overview' | 'timeline' | 'photos' | 'quotes' | 'payments' | 'packages' | 'treatment-plans' | 'consents' | 'crm'

function categoryLabel(t: ReturnType<typeof useClinicLocale>['t'], category: PatientCategory) {
  if (category === 'VIP') return t.categoryVip
  if (category === 'REGULAR') return t.categoryRegular
  if (category === 'NEW') return t.categoryNew
  if (category === 'SENSITIVE') return t.categorySensitive
  return t.categoryHighRisk
}

function tagLabel(t: ReturnType<typeof useClinicLocale>['t'], tag: PatientTag) {
  if (tag === 'vip') return t.tagVip
  if (tag === 'regular') return t.tagRegular
  if (tag === 'new') return t.tagNew
  if (tag === 'sensitive') return t.tagSensitive
  if (tag === 'high-risk') return t.tagHighRisk
  if (tag === 'follow-up-due') return t.tagFollowUpDue
  return t.tagLatePayer
}

function ageFromDob(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

const PHOTO_PROTOCOL_ITEMS = [
  'same_lighting',
  'same_angle',
  'same_distance',
  'clean_background',
  'area_label',
] as const

type PhotoProtocolItemId = (typeof PHOTO_PROTOCOL_ITEMS)[number]

function photoProtocolItemLabel(t: ReturnType<typeof useClinicLocale>['t'], item: PhotoProtocolItemId) {
  if (item === 'same_lighting') return t.photoProtocolSameLighting
  if (item === 'same_angle') return t.photoProtocolSameAngle
  if (item === 'same_distance') return t.photoProtocolSameDistance
  if (item === 'clean_background') return t.photoProtocolCleanBackground
  return t.photoProtocolAreaLabel
}

function photoKindLabel(t: ReturnType<typeof useClinicLocale>['t'], kind: string) {
  if (kind === 'BEFORE') return t.photoKindBefore
  if (kind === 'AFTER') return t.photoKindAfter
  return t.photoKindOther
}

function photoProtocolCheckedFromJson(value: unknown): PhotoProtocolItemId[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const checkedItems = (value as { checkedItems?: unknown }).checkedItems
  if (!Array.isArray(checkedItems)) return []
  return checkedItems.filter((item): item is PhotoProtocolItemId =>
    PHOTO_PROTOCOL_ITEMS.includes(item as PhotoProtocolItemId)
  )
}

function calculateDiscountFromRule(baseCents: number, rule: DiscountRule | undefined) {
  if (!rule?.active) return 0
  const base = Math.max(0, baseCents)
  if (rule.type === 'FIXED') return Math.min(base, rule.fixedCents)
  return Math.min(base, Math.round((base * rule.percentBps) / 10_000))
}

function paymentRefundedCents(payment: PaymentRow) {
  return (payment.correctionsAsOriginal ?? [])
    .filter((correction) => correction.type === 'REFUND')
    .reduce((sum, correction) => sum + correction.amountCents, 0)
}

function paymentRefundableCents(payment: PaymentRow) {
  return payment.status === 'PAID' ? Math.max(0, payment.amountCents - paymentRefundedCents(payment)) : 0
}

function balanceLabel(t: ReturnType<typeof useClinicLocale>['t'], balance: ClientBalance) {
  if (balance.status === 'DEBT') return `${t.balanceDebt}: ${formatMoney(balance.dueCents, balance.currency)}`
  if (balance.status === 'CREDIT') return `${t.balanceCredit}: ${formatMoney(balance.creditCents, balance.currency)}`
  return t.balanceClear
}

function packageStatusLabel(t: ReturnType<typeof useClinicLocale>['t'], status: PackageRow['status']) {
  if (status === 'USED_UP') return t.packageStatusUsedUp
  if (status === 'EXPIRED') return t.packageStatusExpired
  if (status === 'CANCELLED') return t.packageStatusCancelled
  return t.packageStatusActive
}

function treatmentPlanStatusLabel(
  t: ReturnType<typeof useClinicLocale>['t'],
  status: TreatmentPlanRow['status']
) {
  if (status === 'PAUSED') return t.treatmentPlanStatusPaused
  if (status === 'COMPLETED') return t.treatmentPlanStatusCompleted
  if (status === 'CANCELLED') return t.treatmentPlanStatusCancelled
  return t.treatmentPlanStatusActive
}

function treatmentPlanProgress(plan: TreatmentPlanRow) {
  const completed = plan.visits.filter((visit) => visit.status === 'COMPLETED').length
  const expected = Math.max(plan.expectedSessions || 1, 1)
  return {
    completed: Math.min(completed, expected),
    expected,
    percent: Math.min(Math.round((completed / expected) * 100), 100),
  }
}

function balanceTone(balance: ClientBalance) {
  if (balance.status === 'DEBT') return 'border-red-200 bg-red-50 text-red-900'
  if (balance.status === 'CREDIT') return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  return 'border-gray-200 bg-white text-gray-900'
}

export default function PatientRecordClient({ patientId }: { patientId: string }) {
  const router = useRouter()
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all')
  const [editOpen, setEditOpen] = useState(false)
  const [savingPatient, setSavingPatient] = useState(false)
  const [deletingPatient, setDeletingPatient] = useState(false)

  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editHomeAddress, setEditHomeAddress] = useState('')
  const [editArea, setEditArea] = useState('')
  const [editAccessNotes, setEditAccessNotes] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState<PatientTag[]>([])
  const [editReferredByName, setEditReferredByName] = useState('')
  const [editReferralNote, setEditReferralNote] = useState('')
  const [editInternal, setEditInternal] = useState('')
  const [editAllergies, setEditAllergies] = useState('')
  const [editMedications, setEditMedications] = useState('')
  const [editConditions, setEditConditions] = useState('')
  const [editSocial, setEditSocial] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/clinic/patients/${patientId}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.notFound)
      setPatient(null)
      return
    }
    const p = data.patient as PatientRecord
    setPatient(p)
    setEditFirst(p.firstName)
    setEditLast(p.lastName)
    setEditPhone(p.phone ?? '')
    setEditEmail(p.email ?? '')
    setEditHomeAddress(p.homeAddress ?? '')
    setEditArea(p.area ?? '')
    setEditAccessNotes(p.accessNotes ?? '')
    setEditCategory(p.category ?? '')
    setEditTags(p.tags ?? [])
    setEditReferredByName(p.referredByName ?? '')
    setEditReferralNote(p.referralNote ?? '')
    setEditInternal(p.internalNotes ?? '')
    const am = anamnesisFromJson(p.anamnesisJson)
    setEditAllergies(am.allergies)
    setEditMedications(am.medications)
    setEditConditions(am.conditions)
    setEditSocial(am.social)
    setError('')
  }, [patientId, router, t.notFound])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await load()
      } catch {
        if (!cancelled) setError(t.networkError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load, t.networkError])

  const nextAppointment = useMemo(() => {
    if (!patient) return null
    const now = Date.now()
    const upcoming = patient.appointments
      .filter((a) => a.status === 'SCHEDULED' && new Date(a.startsAt).getTime() >= now - 60 * 60 * 1000)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    return upcoming[0] ?? null
  }, [patient])

  const lastVisitWithPlan = useMemo(() => {
    if (!patient) return null
    for (const v of patient.visits) {
      if (v.aftercareTextSnapshot?.trim() || v.nextSteps?.trim()) return v
    }
    return null
  }, [patient])

  const timelineItems = useMemo(() => {
    if (!patient) return []
    return buildTimelineItems(
      patient.appointments,
      patient.visits,
      patient.payments,
      patient.crmActivities,
      dateLocale
    )
  }, [patient, dateLocale])

  const filteredTimeline = useMemo(
    () => filterTimelineItems(timelineItems, timelineFilter),
    [timelineItems, timelineFilter]
  )

  const savePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setSavingPatient(true)
    try {
      let anamnesisJson: ReturnType<typeof anamnesisToStorage>
      try {
        anamnesisJson = anamnesisToStorage({
          allergies: editAllergies,
          medications: editMedications,
          conditions: editConditions,
          social: editSocial,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : t.saveFailed)
        setSavingPatient(false)
        return
      }
      const res = await fetch(`/api/clinic/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: editFirst,
          lastName: editLast,
          phone: editPhone || null,
          email: editEmail || null,
          homeAddress: editHomeAddress || null,
          area: editArea || null,
          accessNotes: editAccessNotes || null,
          category: editCategory || null,
          tags: editTags,
          referredByName: editReferredByName || null,
          referralNote: editReferralNote || null,
          internalNotes: editInternal || null,
          anamnesisJson,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setEditOpen(false)
      await load()
    } catch {
      setError(t.networkError)
    } finally {
      setSavingPatient(false)
    }
  }

  const deletePatientRecord = async () => {
    if (!patient) return
    const confirmation = patientDeleteConfirmation(patient)
    const typed = window.prompt(
      t.deletePatientConfirmationPrompt.replace('{confirmation}', confirmation)
    )
    if (typed == null) return
    if (typed.trim() !== confirmation) {
      setError(t.deletePatientFailed)
      return
    }

    setDeletingPatient(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmation: typed }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.deletePatientFailed)
      }
      window.alert(t.patientRecordDeleted)
      router.replace('/clinic/patients')
    } catch (err) {
      setError(err instanceof Error ? err.message : t.deletePatientFailed)
    } finally {
      setDeletingPatient(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} />
  }

  if (error || !patient) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
        {!error && !patient && <ClinicAlert variant="error">{t.notFound}</ClinicAlert>}
        <Link href="/clinic/patients" className="text-orange-600 text-sm min-h-11 inline-flex items-center">
          {t.backPatients}
        </Link>
      </div>
    )
  }

  const age = ageFromDob(patient.dateOfBirth)
  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: t.overview, icon: ClipboardList },
    { id: 'timeline', label: t.timeline, icon: Clock },
    { id: 'photos', label: t.photos, icon: Camera },
    { id: 'quotes', label: t.priceQuotes, icon: Send },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'packages', label: t.packages, icon: PackageCheck },
    { id: 'treatment-plans', label: t.treatmentPlans, icon: ClipboardList },
    { id: 'consents', label: t.consents, icon: ShieldCheck },
    { id: 'crm', label: t.crm, icon: MessageSquare },
  ]

  const filterChips: { id: TimelineFilter; label: string }[] = [
    { id: 'all', label: t.timelineAll },
    { id: 'appointment', label: t.timelineAppointments },
    { id: 'visit', label: t.timelineVisits },
    { id: 'payment', label: t.timelinePayments },
    { id: 'crm', label: t.timelineCrm },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <Link
        href="/clinic/patients"
        className="text-sm text-orange-600 hover:text-orange-700 inline-block min-h-11 py-2"
      >
        {t.backPatients}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          {patient.lastName}, {patient.firstName}
          {patient.middleName ? ` ${patient.middleName}` : ''}
        </h1>
        <p className="text-gray-600 text-sm">
          {t.dobLabel}{' '}
          {new Date(patient.dateOfBirth).toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {age != null ? ` · ${age} ${t.ageYears}` : ''}
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <a
            href={`/api/clinic/patients/${patient.id}/summary-pdf`}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 shadow-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileDown className="w-4 h-4 text-orange-600 shrink-0" aria-hidden />
            {t.downloadPatientSummaryPdf}
          </a>
          <a
            href={`/api/clinic/patients/${patient.id}/patient-safe-export`}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 shadow-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileDown className="w-4 h-4 text-blue-600 shrink-0" aria-hidden />
            {t.downloadPatientSafeExportPdf}
          </a>
          <a
            href={`/api/clinic/patients/${patient.id}/export`}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 shadow-sm"
          >
            <FileDown className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden />
            {t.downloadPatientFullExport}
          </a>
          <button
            type="button"
            onClick={() => void deletePatientRecord()}
            disabled={deletingPatient}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl border border-red-200 bg-white text-sm font-medium text-red-700 hover:bg-red-50 shadow-sm disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4 shrink-0" aria-hidden />
            {deletingPatient ? t.deletingEllipsis : t.deletePatientRecord}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 max-w-xl">{t.patientSummaryPdfHint}</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xl">{t.patientSafeExportPdfHint}</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xl">{t.patientFullExportHint}</p>
        <p className="text-xs text-red-600 mt-1 max-w-xl">{t.deletePatientRecordHint}</p>
      </div>

      {/* Next actions — tuned for returning patient on iPad */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 mb-2">{t.whatNext}</p>
        <ul className="space-y-2 text-sm text-orange-950">
          {nextAppointment && (
            <li className="flex gap-2">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" aria-hidden />
              <span>
                <span className="font-medium">{t.scheduled} </span>
                {new Date(nextAppointment.startsAt).toLocaleString(dateLocale, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' — '}
                {nextAppointment.procedure?.name || nextAppointment.titleOverride || t.appointmentDefault}
              </span>
            </li>
          )}
          {(lastVisitWithPlan?.aftercareTextSnapshot || lastVisitWithPlan?.nextSteps) && (
            <li className="flex gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" aria-hidden />
              <span>
                <span className="font-medium">{t.fromLastVisit} </span>
                {lastVisitWithPlan.aftercareTextSnapshot || lastVisitWithPlan.nextSteps}
              </span>
            </li>
          )}
          {patient.internalNotes && (
            <li className="flex gap-2">
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" aria-hidden />
              <span>
                <span className="font-medium">{t.staffNotesLabel} </span>
                {patient.internalNotes}
              </span>
            </li>
          )}
          {!nextAppointment && !(lastVisitWithPlan?.aftercareTextSnapshot || lastVisitWithPlan?.nextSteps) && !patient.internalNotes && (
            <li className="text-orange-800/90">{t.noUpcoming}</li>
          )}
        </ul>
      </div>

      <BalanceSummaryCard balance={patient.clientBalance} />

      <PatientPortalCard patient={patient} onRefresh={load} />

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 min-h-11',
              tab === id
                ? 'bg-white text-orange-800 shadow-sm border border-orange-100'
                : 'text-gray-600 hover:bg-white/70'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <OverviewTab
          patient={patient}
          editOpen={editOpen}
          setEditOpen={setEditOpen}
          editFirst={editFirst}
          setEditFirst={setEditFirst}
          editLast={editLast}
          setEditLast={setEditLast}
          editPhone={editPhone}
          setEditPhone={setEditPhone}
          editEmail={editEmail}
          setEditEmail={setEditEmail}
          editHomeAddress={editHomeAddress}
          setEditHomeAddress={setEditHomeAddress}
          editArea={editArea}
          setEditArea={setEditArea}
          editAccessNotes={editAccessNotes}
          setEditAccessNotes={setEditAccessNotes}
          editCategory={editCategory}
          setEditCategory={setEditCategory}
          editTags={editTags}
          setEditTags={setEditTags}
          editReferredByName={editReferredByName}
          setEditReferredByName={setEditReferredByName}
          editReferralNote={editReferralNote}
          setEditReferralNote={setEditReferralNote}
          editInternal={editInternal}
          setEditInternal={setEditInternal}
          editAllergies={editAllergies}
          setEditAllergies={setEditAllergies}
          editMedications={editMedications}
          setEditMedications={setEditMedications}
          editConditions={editConditions}
          setEditConditions={setEditConditions}
          editSocial={editSocial}
          setEditSocial={setEditSocial}
          savePatient={savePatient}
          savingPatient={savingPatient}
          onVisitLogged={load}
        />
      )}
      {tab === 'timeline' && (
        <div className="space-y-3">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label={t.timeline}
          >
            {filterChips.map(({ id: fid, label: fl }) => (
              <button
                key={fid}
                type="button"
                role="tab"
                aria-selected={timelineFilter === fid}
                onClick={() => setTimelineFilter(fid)}
                className={clsx(
                  'min-h-11 px-3 rounded-xl text-sm font-medium border transition-colors',
                  timelineFilter === fid
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                )}
              >
                {fl}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {timelineItems.length === 0 ? (
              <ClinicEmptyState title={t.noHistory} className="border-0 shadow-none" />
            ) : filteredTimeline.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">{t.noTimeline}</p>
            ) : (
              filteredTimeline.map((item, i) => (
                <div key={`${item.sort}-${item.kind}-${i}`} className="p-4 text-sm">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-gray-700 mt-0.5 whitespace-pre-wrap">{item.detail}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.meta}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {tab === 'photos' && <PhotosTab patient={patient} onRefresh={load} />}
      {tab === 'quotes' && <PriceQuotesTab patient={patient} onRefresh={load} />}
      {tab === 'payments' && <PaymentsTab patient={patient} onRefresh={load} />}
      {tab === 'packages' && <PackagesTab patient={patient} onRefresh={load} />}
      {tab === 'treatment-plans' && <TreatmentPlansTab patient={patient} onRefresh={load} />}
      {tab === 'consents' && <ConsentsTab patient={patient} onRefresh={load} />}
      {tab === 'crm' && <CrmTab patient={patient} onRefresh={load} />}
    </div>
  )
}

function BalanceSummaryCard({ balance }: { balance: ClientBalance }) {
  const { t } = useClinicLocale()

  return (
    <section className={clsx('rounded-2xl border p-5 shadow-sm', balanceTone(balance))}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{t.clientBalance}</p>
          <p className="mt-1 text-xl font-semibold">{balanceLabel(t, balance)}</p>
        </div>
        <p className="text-xs opacity-70 sm:max-w-xs">{t.balanceHint}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="opacity-70">{t.balanceExpected}</dt>
          <dd className="font-semibold">{formatMoney(balance.expectedCents, balance.currency)}</dd>
        </div>
        <div>
          <dt className="opacity-70">{t.paid}</dt>
          <dd className="font-semibold">{formatMoney(balance.paidCents, balance.currency)}</dd>
        </div>
        <div>
          <dt className="opacity-70">{t.balanceRefunded}</dt>
          <dd className="font-semibold">{formatMoney(balance.refundedCents, balance.currency)}</dd>
        </div>
        <div>
          <dt className="opacity-70">{t.balancePending}</dt>
          <dd className="font-semibold">{formatMoney(balance.pendingCents, balance.currency)}</dd>
        </div>
      </dl>
    </section>
  )
}

function PatientPortalCard({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState('')
  const [portalUrl, setPortalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const now = Date.now()
  const activeLink =
    patient.portalLinks.find((link) => !link.revokedAt && new Date(link.expiresAt).getTime() >= now) ?? null
  const latestRequests = patient.portalRequests.slice(0, 3)

  const createLink = async () => {
    setCreating(true)
    setError('')
    setCopied(false)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/portal-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ expiryDays: 90 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setPortalUrl(data.url)
      await navigator.clipboard?.writeText(data.url).catch(() => undefined)
      setCopied(true)
      await onRefresh()
    } catch {
      setError(t.networkError)
    } finally {
      setCreating(false)
    }
  }

  const revokeLink = async (linkId: string) => {
    setRevoking(linkId)
    setError('')
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/portal-link`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ linkId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      if (activeLink?.id === linkId) setPortalUrl('')
      await onRefresh()
    } catch {
      setError(t.networkError)
    } finally {
      setRevoking('')
    }
  }

  const copyLink = async () => {
    if (!portalUrl) return
    await navigator.clipboard?.writeText(portalUrl).catch(() => undefined)
    setCopied(true)
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">{t.patientPortalLite}</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-950">{t.patientPortalPrivateLink}</h2>
          <p className="mt-1 text-sm leading-relaxed text-blue-950/80">{t.patientPortalPrivateLinkHint}</p>
        </div>
        <button
          type="button"
          onClick={createLink}
          disabled={creating}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Link2 className="h-4 w-4" aria-hidden />
          {creating ? t.creatingEllipsis : t.patientPortalCreateLink}
        </button>
      </div>

      {error && <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {portalUrl && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            {copied ? t.patientPortalCopied : t.patientPortalCopyLink}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={portalUrl}
              className="min-h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-800"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {t.copy}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-white p-4">
          <p className="text-sm font-semibold text-gray-950">{t.patientPortalActiveLink}</p>
          {activeLink ? (
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <p>
                {t.patientPortalTokenEnding} <span className="font-mono text-gray-900">{activeLink.tokenLastFour}</span>
              </p>
              <p>
                {t.expires}{' '}
                {new Date(activeLink.expiresAt).toLocaleDateString(dateLocale, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              {activeLink.lastAccessedAt && (
                <p>
                  {t.patientPortalLastOpened}{' '}
                  {new Date(activeLink.lastAccessedAt).toLocaleString(dateLocale, {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              <button
                type="button"
                onClick={() => revokeLink(activeLink.id)}
                disabled={revoking === activeLink.id}
                className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" aria-hidden />
                {revoking === activeLink.id ? t.deletingEllipsis : t.patientPortalRevokeLink}
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{t.patientPortalNoActiveLink}</p>
          )}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-4">
          <p className="text-sm font-semibold text-gray-950">{t.patientPortalRequests}</p>
          {latestRequests.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">{t.patientPortalNoRequests}</p>
          ) : (
            <div className="mt-2 space-y-3">
              {latestRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {request.type === 'RESCHEDULE'
                      ? t.patientPortalRequestReschedule
                      : request.type === 'CANCEL'
                        ? t.patientPortalRequestCancel
                        : t.patientPortalRequestMessage}
                    {' · '}
                    {request.status}
                  </p>
                  <p className="mt-1 text-gray-600 whitespace-pre-wrap">{request.message}</p>
                  {request.preferredTime && (
                    <p className="mt-1 text-gray-500">
                      {t.patientPortalPreferredTime}: {request.preferredTime}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleString(dateLocale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function OverviewTab({
  patient,
  editOpen,
  setEditOpen,
  editFirst,
  setEditFirst,
  editLast,
  setEditLast,
  editPhone,
  setEditPhone,
  editEmail,
  setEditEmail,
  editHomeAddress,
  setEditHomeAddress,
  editArea,
  setEditArea,
  editAccessNotes,
  setEditAccessNotes,
  editCategory,
  setEditCategory,
  editTags,
  setEditTags,
  editReferredByName,
  setEditReferredByName,
  editReferralNote,
  setEditReferralNote,
  editInternal,
  setEditInternal,
  editAllergies,
  setEditAllergies,
  editMedications,
  setEditMedications,
  editConditions,
  setEditConditions,
  editSocial,
  setEditSocial,
  savePatient,
  savingPatient,
  onVisitLogged,
}: {
  patient: PatientRecord
  editOpen: boolean
  setEditOpen: (v: boolean) => void
  editFirst: string
  setEditFirst: (v: string) => void
  editLast: string
  setEditLast: (v: string) => void
  editPhone: string
  setEditPhone: (v: string) => void
  editEmail: string
  setEditEmail: (v: string) => void
  editHomeAddress: string
  setEditHomeAddress: (v: string) => void
  editArea: string
  setEditArea: (v: string) => void
  editAccessNotes: string
  setEditAccessNotes: (v: string) => void
  editCategory: string
  setEditCategory: (v: string) => void
  editTags: PatientTag[]
  setEditTags: (v: PatientTag[]) => void
  editReferredByName: string
  setEditReferredByName: (v: string) => void
  editReferralNote: string
  setEditReferralNote: (v: string) => void
  editInternal: string
  setEditInternal: (v: string) => void
  editAllergies: string
  setEditAllergies: (v: string) => void
  editMedications: string
  setEditMedications: (v: string) => void
  editConditions: string
  setEditConditions: (v: string) => void
  editSocial: string
  setEditSocial: (v: string) => void
  savePatient: (e: React.FormEvent) => Promise<void>
  savingPatient: boolean
  onVisitLogged: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const amDisplay = anamnesisFromJson(patient.anamnesisJson)
  const hasAnamnesis =
    !!(amDisplay.allergies || amDisplay.medications || amDisplay.conditions || amDisplay.social)
  const [visitAt, setVisitAt] = useState(defaultVisitDateTimeInput)
  const [chief, setChief] = useState('')
  const [summary, setSummary] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [treatmentPlanId, setTreatmentPlanId] = useState('')
  const [aftercareTemplates, setAftercareTemplates] = useState<AftercareTemplateRow[]>([])
  const [aftercareTemplateId, setAftercareTemplateId] = useState('')
  const [logging, setLogging] = useState(false)
  const [online, setOnline] = useState(true)
  const [draftHydrated, setDraftHydrated] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [scratchpadDraft, setScratchpadDraft] = useState('')
  const [visitSaveMessage, setVisitSaveMessage] = useState('')
  const activeTreatmentPlans = patient.treatmentPlans.filter((plan) =>
    ['ACTIVE', 'PAUSED'].includes(plan.status)
  )
  const offlineDraftKey = useMemo(() => `clinic:visit-draft:${patient.id}`, [patient.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/clinic/aftercare-templates', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setAftercareTemplates((data.templates || []).filter((template: AftercareTemplateRow) => template.active))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    setDraftHydrated(false)
    setVisitSaveMessage('')
    const resetVisitDraftForm = () => {
      setVisitAt(defaultVisitDateTimeInput())
      setChief('')
      setSummary('')
      setNextSteps('')
      setStaffNotes('')
      setTreatmentPlanId('')
      setAftercareTemplateId('')
    }
    try {
      const stored = window.localStorage.getItem(offlineDraftKey)
      if (stored) {
        const draft = JSON.parse(stored) as Partial<OfflineVisitDraft>
        if (draft.patientId === patient.id) {
          setVisitAt(typeof draft.visitAt === 'string' && draft.visitAt ? draft.visitAt : defaultVisitDateTimeInput())
          setChief(typeof draft.chiefComplaint === 'string' ? draft.chiefComplaint : '')
          setSummary(typeof draft.procedureSummary === 'string' ? draft.procedureSummary : '')
          setNextSteps(typeof draft.nextSteps === 'string' ? draft.nextSteps : '')
          setStaffNotes(typeof draft.staffNotes === 'string' ? draft.staffNotes : '')
          setTreatmentPlanId(typeof draft.treatmentPlanId === 'string' ? draft.treatmentPlanId : '')
          setAftercareTemplateId(typeof draft.aftercareTemplateId === 'string' ? draft.aftercareTemplateId : '')
          setDraftSavedAt(typeof draft.updatedAt === 'string' ? draft.updatedAt : null)
        } else {
          resetVisitDraftForm()
          setDraftSavedAt(null)
        }
      } else {
        resetVisitDraftForm()
        setDraftSavedAt(null)
      }
      setScratchpadDraft(window.localStorage.getItem(PWA_SCRATCHPAD_DRAFT_KEY) ?? '')
    } catch {
      setDraftSavedAt(null)
      setScratchpadDraft('')
    } finally {
      setDraftHydrated(true)
    }
  }, [offlineDraftKey, patient.id])

  useEffect(() => {
    if (!draftHydrated) return
    const hasDraft =
      chief.trim() ||
      summary.trim() ||
      nextSteps.trim() ||
      staffNotes.trim() ||
      treatmentPlanId ||
      aftercareTemplateId

    try {
      if (!hasDraft) {
        window.localStorage.removeItem(offlineDraftKey)
        setDraftSavedAt(null)
        return
      }
      const updatedAt = new Date().toISOString()
      const draft: OfflineVisitDraft = {
        patientId: patient.id,
        visitAt,
        chiefComplaint: chief,
        procedureSummary: summary,
        nextSteps,
        staffNotes,
        treatmentPlanId,
        aftercareTemplateId,
        updatedAt,
      }
      window.localStorage.setItem(offlineDraftKey, JSON.stringify(draft))
      setDraftSavedAt(updatedAt)
    } catch {
      /* local storage can fail in private mode; keep the in-memory form intact */
    }
  }, [
    aftercareTemplateId,
    chief,
    draftHydrated,
    nextSteps,
    offlineDraftKey,
    patient.id,
    staffNotes,
    summary,
    treatmentPlanId,
    visitAt,
  ])

  const selectedAftercareTemplate = aftercareTemplates.find((template) => template.id === aftercareTemplateId)

  function toggleTag(tag: PatientTag) {
    setEditTags(
      editTags.includes(tag)
        ? editTags.filter((item) => item !== tag)
        : [...editTags, tag]
    )
  }

  const importScratchpadDraft = () => {
    if (!scratchpadDraft.trim()) return
    setSummary((current) => (current.trim() ? `${current.trim()}\n\n${scratchpadDraft.trim()}` : scratchpadDraft.trim()))
    setScratchpadDraft('')
    try {
      window.localStorage.removeItem(PWA_SCRATCHPAD_DRAFT_KEY)
    } catch {
      /* ignore */
    }
    setVisitSaveMessage(t.offlineVisitDraftImported)
  }

  const clearOfflineVisitDraft = () => {
    if (!window.confirm(t.offlineVisitDraftClearConfirm)) return
    setChief('')
    setSummary('')
    setNextSteps('')
    setStaffNotes('')
    setTreatmentPlanId('')
    setAftercareTemplateId('')
    setVisitSaveMessage(t.offlineVisitDraftCleared)
    try {
      window.localStorage.removeItem(offlineDraftKey)
    } catch {
      /* ignore */
    }
    setDraftSavedAt(null)
  }

  const logVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLogging(true)
    setVisitSaveMessage('')
    try {
      const iso = new Date(visitAt).toISOString()
      const res = await fetch('/api/clinic/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: patient.id,
          visitAt: iso,
          chiefComplaint: chief || null,
          procedureSummary: summary || null,
          nextSteps: nextSteps || null,
          staffNotes: staffNotes || null,
          treatmentPlanId: treatmentPlanId || null,
          aftercareTemplateId: aftercareTemplateId || null,
          status: 'COMPLETED',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.couldNotLogVisit)
        return
      }
      setChief('')
      setSummary('')
      setNextSteps('')
      setStaffNotes('')
      setTreatmentPlanId('')
      setAftercareTemplateId('')
      try {
        window.localStorage.removeItem(offlineDraftKey)
      } catch {
        /* ignore */
      }
      setDraftSavedAt(null)
      setVisitSaveMessage(t.offlineVisitDraftSynced)
      await onVisitLogged()
    } catch {
      setVisitSaveMessage(t.offlineVisitDraftKept)
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2 text-sm">
        <div className="flex justify-between items-start gap-3">
          <p className="font-medium text-gray-900">{t.contact}</p>
          <button
            type="button"
            onClick={() => setEditOpen(!editOpen)}
            className="text-orange-600 text-sm font-medium flex items-center gap-1"
          >
            {editOpen ? (
              <>
                <ChevronUp className="w-4 h-4" /> {t.close}
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" /> {t.edit}
              </>
            )}
          </button>
        </div>
        <p>
          <span className="text-gray-500">{t.phoneLabel}:</span> {patient.phone || t.emptyValue}
        </p>
        <p>
          <span className="text-gray-500">{t.emailLabel}:</span> {patient.email || t.emptyValue}
        </p>
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {t.homeVisitRoute}
          </p>
          <p>
            <span className="text-gray-500">{t.homeAddress}:</span>{' '}
            {patient.homeAddress || t.emptyValue}
          </p>
          <p>
            <span className="text-gray-500">{t.area}:</span> {patient.area || t.emptyValue}
          </p>
          <p>
            <span className="text-gray-500">{t.accessNotes}:</span>{' '}
            {patient.accessNotes || t.emptyValue}
          </p>
        </div>
        <div className="pt-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t.patientCategory}
          </p>
          <div className="flex flex-wrap gap-2">
            {patient.category ? (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                {categoryLabel(t, patient.category)}
              </span>
            ) : (
              <span className="text-gray-500">{t.noCategory}</span>
            )}
            {patient.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                {tagLabel(t, tag)}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-orange-50/70 border border-orange-100 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
            {t.referralTracking}
          </p>
          <p>
            <span className="text-gray-500">{t.referredBy}:</span>{' '}
            {patient.referredByName || t.emptyValue}
          </p>
          {patient.referralNote && (
            <p className="mt-1">
              <span className="text-gray-500">{t.referralNote}:</span> {patient.referralNote}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 text-sm">
        <p className="font-medium text-gray-900">{t.anamnesisHeading}</p>
        <p className="text-xs text-gray-500">{t.anamnesisHint}</p>
        {hasAnamnesis ? (
          <dl className="space-y-2 text-gray-800">
            {amDisplay.allergies ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisAllergies}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.allergies}</dd>
              </div>
            ) : null}
            {amDisplay.medications ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisMedications}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.medications}</dd>
              </div>
            ) : null}
            {amDisplay.conditions ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisConditions}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.conditions}</dd>
              </div>
            ) : null}
            {amDisplay.social ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisSocial}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.social}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-gray-500">{t.anamnesisNoneOnFile}</p>
        )}
      </div>

      {editOpen && (
        <form
          onSubmit={savePatient}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">{t.firstName}</label>
              <input
                value={editFirst}
                onChange={(e) => setEditFirst(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.lastName}</label>
              <input
                value={editLast}
                onChange={(e) => setEditLast(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.phoneLabel}</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.emailLabel}</label>
            <input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              inputMode="email"
            />
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
            <p className="text-sm font-semibold text-emerald-950">{t.homeVisitRoute}</p>
            <div>
              <label className="block text-gray-600 mb-1">{t.homeAddress}</label>
              <textarea
                value={editHomeAddress}
                onChange={(e) => setEditHomeAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.area}</label>
              <input
                value={editArea}
                onChange={(e) => setEditArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.accessNotes}</label>
              <textarea
                value={editAccessNotes}
                onChange={(e) => setEditAccessNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.patientCategory}</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            >
              <option value="">{t.noCategory}</option>
              {PATIENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(t, category)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="block text-gray-600 mb-1">{t.patientTags}</p>
            <p className="mb-2 text-xs text-gray-500">{t.patientTagsHint}</p>
            <div className="flex flex-wrap gap-2">
              {PATIENT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold',
                    editTags.includes(tag)
                      ? 'border-orange-200 bg-orange-50 text-orange-800'
                      : 'border-gray-200 bg-white text-gray-600'
                  )}
                >
                  {tagLabel(t, tag)}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-950">{t.referralTracking}</p>
            <div>
              <label className="block text-gray-600 mb-1">{t.referredBy}</label>
              <input
                value={editReferredByName}
                onChange={(e) => setEditReferredByName(e.target.value)}
                placeholder={t.referredByPlaceholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.referralNote}</label>
              <textarea
                value={editReferralNote}
                onChange={(e) => setEditReferralNote(e.target.value)}
                placeholder={t.referralNotePlaceholder}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.internalNotesStaff}</label>
            <textarea
              value={editInternal}
              onChange={(e) => setEditInternal(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="font-medium text-gray-800">{t.anamnesisHeading}</p>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisAllergies}</label>
              <textarea
                value={editAllergies}
                onChange={(e) => setEditAllergies(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisMedications}</label>
              <textarea
                value={editMedications}
                onChange={(e) => setEditMedications(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisConditions}</label>
              <textarea
                value={editConditions}
                onChange={(e) => setEditConditions(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisSocial}</label>
              <textarea
                value={editSocial}
                onChange={(e) => setEditSocial(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPatient}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
          >
            {savingPatient ? t.savingEllipsis : t.savePatient}
          </button>
        </form>
      )}

      <form
        onSubmit={logVisit}
        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.logVisit}</h2>
            <p className="text-sm text-gray-500">{t.logVisitHint}</p>
          </div>
          <div
            className={clsx(
              'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            )}
          >
            {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {online ? t.offlineVisitOnline : t.offlineVisitOffline}
          </div>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-orange-950">{t.offlineVisitDraftTitle}</p>
              <p className="mt-1 text-orange-800/80">{t.offlineVisitDraftHint}</p>
              {draftSavedAt && (
                <p className="mt-2 text-xs font-medium text-orange-700">
                  {t.offlineVisitDraftSaved}:{' '}
                  {new Date(draftSavedAt).toLocaleString(dateLocale, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {visitSaveMessage && (
                <p className="mt-2 text-xs font-medium text-orange-700">{visitSaveMessage}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {scratchpadDraft.trim() && (
                <button
                  type="button"
                  onClick={importScratchpadDraft}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-orange-700 shadow-sm hover:bg-orange-100"
                >
                  {t.offlineVisitImportScratchpad}
                </button>
              )}
              {draftSavedAt && (
                <button
                  type="button"
                  onClick={clearOfflineVisitDraft}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
                >
                  {t.offlineVisitDiscardDraft}
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.visitDateTime}</label>
          <input
            type="datetime-local"
            value={visitAt}
            onChange={(e) => setVisitAt(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        {activeTreatmentPlans.length > 0 && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.linkToTreatmentPlan}</label>
            <select
              value={treatmentPlanId}
              onChange={(e) => setTreatmentPlanId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.emptyValue}</option>
              {activeTreatmentPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.chiefComplaint}</label>
          <textarea
            value={chief}
            onChange={(e) => setChief(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.procedureSummary}</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.nextStepsHint}</label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        {aftercareTemplates.length > 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <label className="block text-sm font-medium text-emerald-950 mb-1">{t.aftercareTemplate}</label>
            <select
              value={aftercareTemplateId}
              onChange={(e) => setAftercareTemplateId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-emerald-100 bg-white text-base"
            >
              <option value="">{t.noAftercareTemplateSelected}</option>
              {aftercareTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                  {template.procedure ? ` · ${template.procedure.name}` : ''}
                </option>
              ))}
            </select>
            {selectedAftercareTemplate && (
              <div className="mt-3 rounded-xl bg-white p-3 text-sm text-emerald-950">
                {selectedAftercareTemplate.messageBody && (
                  <p className="whitespace-pre-wrap">{selectedAftercareTemplate.messageBody}</p>
                )}
                {selectedAftercareTemplate.documentUrl && (
                  <p className="mt-2 text-xs text-emerald-700">
                    {selectedAftercareTemplate.documentName || t.aftercareDocumentReference}:{' '}
                    {selectedAftercareTemplate.documentUrl}
                  </p>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-emerald-700">{t.aftercareVisitHint}</p>
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.staffNotesVisit}</label>
          <textarea
            value={staffNotes}
            onChange={(e) => setStaffNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={logging}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-60"
        >
          {logging ? t.savingEllipsis : online ? t.saveVisit : t.offlineVisitSyncWhenOnline}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t.recentAppointments}</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {patient.appointments.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{t.noAppointmentsYet}</p>
          ) : (
            patient.appointments.slice(0, 8).map((a) => (
              <div key={a.id} className="p-4 text-sm">
                <p className="font-medium text-gray-900">
                  {new Date(a.startsAt).toLocaleString(dateLocale, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-gray-600">
                  {a.procedure?.name || a.titleOverride || t.appointmentDefault}
                  <span className="text-gray-400"> · {a.status}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PhotosTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [visitId, setVisitId] = useState<string>('')
  const [kind, setKind] = useState<string>('BEFORE')
  const [caption, setCaption] = useState('')
  const [protocolChecked, setProtocolChecked] = useState<PhotoProtocolItemId[]>([
    'same_lighting',
    'same_angle',
  ])
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [protocolNote, setProtocolNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [syncingOfflinePhotoId, setSyncingOfflinePhotoId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [offlinePhotos, setOfflinePhotos] = useState<OfflineMediaDraft[]>([])

  const selectedVisit = useMemo(
    () => (visitId ? patient.visits.find((visit) => visit.id === visitId) ?? null : null),
    [patient.visits, visitId]
  )
  const selectedProcedureName =
    selectedVisit?.appointment?.procedure?.name ?? selectedVisit?.treatmentPlan?.title ?? null

  const loadOfflinePhotos = useCallback(async () => {
    try {
      setOfflinePhotos(await readOfflineMediaDrafts(patient.id))
    } catch {
      setOfflinePhotos([])
    }
  }, [patient.id])

  useEffect(() => {
    void loadOfflinePhotos()
  }, [loadOfflinePhotos])

  const toggleProtocolItem = (item: PhotoProtocolItemId) => {
    setProtocolChecked((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    )
  }

  const appendPhotoFormFields = (
    fd: FormData,
    values: {
      visitId: string
      kind: string
      caption: string
      protocolChecked: PhotoProtocolItemId[]
      protocolProcedureName: string | null
      protocolNote: string
      marketingConsent: boolean
    }
  ) => {
    fd.append('kind', values.kind)
    if (values.visitId) fd.append('visitId', values.visitId)
    if (values.caption.trim()) fd.append('caption', values.caption.trim())
    fd.append('protocolChecked', JSON.stringify(values.protocolChecked))
    if (values.protocolProcedureName) fd.append('protocolProcedureName', values.protocolProcedureName)
    if (values.protocolNote.trim()) fd.append('protocolNote', values.protocolNote.trim())
    if (values.marketingConsent) fd.append('marketingConsent', 'true')
  }

  const queueOfflinePhoto = async (file: File) => {
    const draft: OfflineMediaDraft = {
      id: `${patient.id}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      patientId: patient.id,
      visitId,
      kind,
      caption,
      protocolChecked,
      marketingConsent,
      protocolNote,
      protocolProcedureName: selectedProcedureName,
      fileName: file.name || 'clinic-photo.jpg',
      mimeType: file.type || 'image/jpeg',
      dataUrl: await fileToDataUrl(file),
      createdAt: new Date().toISOString(),
    }
    await saveOfflineMediaDraft(draft)
    setCaption('')
    setProtocolNote('')
    setMarketingConsent(false)
    await loadOfflinePhotos()
    setNotice(t.offlinePhotoQueued)
  }

  const uploadQueuedPhoto = async (draft: OfflineMediaDraft) => {
    setSyncingOfflinePhotoId(draft.id)
    setError(null)
    try {
      const blob = await fetch(draft.dataUrl).then((res) => res.blob())
      const fd = new FormData()
      fd.append('file', blob, draft.fileName)
      appendPhotoFormFields(fd, draft)
      const res = await fetch(`/api/clinic/patients/${patient.id}/media`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.uploadFailed)
      }
      await deleteOfflineMediaDraft(draft.id)
      await loadOfflinePhotos()
      await onRefresh()
      setNotice(t.offlinePhotoSynced)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.offlinePhotoSyncFailed)
    } finally {
      setSyncingOfflinePhotoId(null)
    }
  }

  const syncAllQueuedPhotos = async () => {
    for (const draft of offlinePhotos) {
      await uploadQueuedPhoto(draft)
    }
  }

  const deleteQueuedPhoto = async (draftId: string) => {
    if (!window.confirm(t.offlinePhotoDeleteConfirm)) return
    await deleteOfflineMediaDraft(draftId)
    await loadOfflinePhotos()
    setNotice(null)
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    setNotice(null)
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await queueOfflinePhoto(file)
        return
      }
      const fd = new FormData()
      fd.append('file', file)
      appendPhotoFormFields(fd, {
        visitId,
        kind,
        caption,
        protocolChecked,
        protocolProcedureName: selectedProcedureName,
        protocolNote,
        marketingConsent,
      })
      const res = await fetch(`/api/clinic/patients/${patient.id}/media`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.uploadFailed)
        return
      }
      setCaption('')
      setProtocolNote('')
      setMarketingConsent(false)
      await onRefresh()
    } catch (e) {
      try {
        await queueOfflinePhoto(file)
      } catch {
        setError(e instanceof Error ? e.message : t.uploadFailed)
      }
    } finally {
      setUploading(false)
    }
  }

  const deleteMedia = async (mediaId: string) => {
    if (!window.confirm(t.confirmDeletePhoto)) return
    setDeletingId(mediaId)
    setError(null)
    try {
      const res = await fetch(`/api/clinic/media/${mediaId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.deletePhotoFailed)
      }
      await onRefresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.deletePhotoFailed)
    } finally {
      setDeletingId(null)
    }
  }

  const allMedia = useMemo(() => {
    return patient.media
      .map((m) => {
        const v = m.visitId ? patient.visits.find((x) => x.id === m.visitId) : null
        return {
          ...m,
          visitLabel: v
            ? new Date(v.visitAt).toLocaleDateString(dateLocale)
            : t.visitUnassigned,
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [patient, dateLocale, t.visitUnassigned])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-600" />
          {t.addPhotoTitle}
        </h2>
        <p className="text-sm text-gray-500">{t.addPhotoHint}</p>
        {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
        {notice && (
          <ClinicAlert variant="success" role="status">
            {notice}
          </ClinicAlert>
        )}
        {offlinePhotos.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-950">{t.offlinePhotoDraftsTitle}</p>
                <p className="mt-1 text-xs text-amber-800">{t.offlinePhotoDraftsHint}</p>
              </div>
              <button
                type="button"
                onClick={() => void syncAllQueuedPhotos()}
                disabled={!!syncingOfflinePhotoId}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-100 disabled:opacity-60"
              >
                {syncingOfflinePhotoId ? t.uploadingEllipsis : t.offlinePhotoSyncAll}
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {offlinePhotos.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white p-2 text-xs text-gray-700"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src={draft.dataUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {photoKindLabel(t, draft.kind)} ·{' '}
                        {new Date(draft.createdAt).toLocaleString(dateLocale, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="truncate text-gray-500">{draft.caption || t.offlinePhotoNoCaption}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => void uploadQueuedPhoto(draft)}
                      disabled={!!syncingOfflinePhotoId}
                      className="rounded-lg bg-amber-600 px-2.5 py-1.5 font-semibold text-white disabled:opacity-60"
                    >
                      {syncingOfflinePhotoId === draft.id ? t.uploadingEllipsis : t.offlinePhotoSync}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteQueuedPhoto(draft.id)}
                      disabled={!!syncingOfflinePhotoId}
                      className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-semibold text-gray-600 disabled:opacity-60"
                    >
                      {t.deletePhoto}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.linkToVisit}</label>
            <select
              value={visitId}
              onChange={(e) => setVisitId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.notLinked}</option>
              {patient.visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {new Date(v.visitAt).toLocaleString(dateLocale, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.photoType}</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="BEFORE">{t.photoKindBefore}</option>
              <option value="AFTER">{t.photoKindAfter}</option>
              <option value="OTHER">{t.photoKindOther}</option>
            </select>
          </div>
        </div>
        <label className="block">
          <span className="block text-sm text-gray-600 mb-1">{t.photoCaption}</span>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t.photoCaptionPlaceholder}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          />
        </label>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-950">{t.photoProtocolChecklist}</p>
            <p className="mt-1 text-xs text-blue-800">
              {selectedProcedureName
                ? t.photoProtocolProcedureHint.replace('{procedure}', selectedProcedureName)
                : t.photoProtocolGenericHint}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PHOTO_PROTOCOL_ITEMS.map((item) => (
              <label key={item} className="flex items-start gap-2 rounded-xl bg-white/70 p-2 text-sm text-blue-950">
                <input
                  type="checkbox"
                  checked={protocolChecked.includes(item)}
                  onChange={() => toggleProtocolItem(item)}
                  className="mt-1 h-4 w-4 rounded border-blue-200 text-blue-600"
                />
                <span>{photoProtocolItemLabel(t, item)}</span>
              </label>
            ))}
          </div>
          <label className="flex items-start gap-2 text-sm text-blue-950">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-blue-200 text-blue-600"
            />
            <span>{t.photoMarketingConsent}</span>
          </label>
          <input
            value={protocolNote}
            onChange={(e) => setProtocolNote(e.target.value)}
            placeholder={t.photoProtocolNotePlaceholder}
            className="w-full px-3 py-2.5 rounded-xl border border-blue-100 text-sm bg-white"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-orange-200 rounded-2xl bg-orange-50/50 cursor-pointer hover:bg-orange-50 transition-colors">
            <Camera className="w-8 h-8 text-orange-500" />
            <span className="text-sm font-semibold text-orange-900">
              {uploading ? t.uploadingEllipsis : t.takePhoto}
            </span>
            <span className="text-xs text-orange-700">{t.takePhotoHint}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              disabled={uploading}
              onChange={onFile}
            />
          </label>
          <label className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <ImagePlus className="w-8 h-8 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">
              {uploading ? t.uploadingEllipsis : t.chooseExistingPhoto}
            </span>
            <span className="text-xs text-gray-500">{t.chooseExistingPhotoHint}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={onFile}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allMedia.map((m) => {
          const checked = photoProtocolCheckedFromJson(m.protocolJson)
          return (
            <div key={m.id} className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/clinic/media/${m.id}`}
                alt={m.caption || m.kind}
                className="w-full aspect-square object-cover"
              />
              <div className="p-2 text-[11px] text-gray-600 space-y-2">
                <div>
                  <span className="font-semibold text-gray-800">{m.kind}</span>
                  <span className="text-gray-400"> · </span>
                  {m.visitLabel}
                  {m.caption && <p className="mt-1 text-gray-700 line-clamp-2">{m.caption}</p>}
                </div>
                {checked.length > 0 && (
                  <p className="rounded-lg bg-blue-50 px-2 py-1 text-blue-800">
                    {t.photoProtocol}: {checked.length}/{PHOTO_PROTOCOL_ITEMS.length}
                  </p>
                )}
                {m.marketingConsent && (
                  <p className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">
                    {t.photoMarketingConsentShort}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => deleteMedia(m.id)}
                  disabled={deletingId === m.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="w-3 h-3" aria-hidden />
                  {deletingId === m.id ? t.deletingEllipsis : t.deletePhoto}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {allMedia.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">{t.noPhotosYet}</p>
      )}
    </div>
  )
}

function TreatmentPlansTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [procedures, setProcedures] = useState<Array<{ id: string; name: string; active: boolean }>>([])
  const [title, setTitle] = useState('')
  const [procedureId, setProcedureId] = useState('')
  const [expectedSessions, setExpectedSessions] = useState('4')
  const [cadenceDays, setCadenceDays] = useState('14')
  const [targetStartAt, setTargetStartAt] = useState('')
  const [targetEndAt, setTargetEndAt] = useState('')
  const [goals, setGoals] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [photoMilestones, setPhotoMilestones] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/clinic/procedures', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setProcedures((data.procedures || []).filter((procedure: { active: boolean }) => procedure.active))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert(t.treatmentPlanTitleRequired)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/treatment-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          procedureId: procedureId || null,
          expectedSessions: Number.parseInt(expectedSessions, 10),
          cadenceDays: Number.parseInt(cadenceDays, 10),
          targetStartAt: targetStartAt || null,
          targetEndAt: targetEndAt || null,
          goals: goals || null,
          nextSteps: nextSteps || null,
          photoMilestones: photoMilestones
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setTitle('')
      setProcedureId('')
      setExpectedSessions('4')
      setCadenceDays('14')
      setTargetStartAt('')
      setTargetEndAt('')
      setGoals('')
      setNextSteps('')
      setPhotoMilestones('')
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (planId: string, status: TreatmentPlanRow['status']) => {
    setBusyPlanId(planId)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/treatment-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      await onRefresh()
    } finally {
      setBusyPlanId(null)
    }
  }

  const plans = [...patient.treatmentPlans].sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-purple-100 bg-purple-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{t.treatmentPlans}</p>
        <h2 className="mt-1 text-xl font-semibold text-purple-950">{t.createTreatmentPlan}</h2>
        <p className="mt-1 text-sm text-purple-800">{t.treatmentPlanHint}</p>
      </section>

      <form onSubmit={createPlan} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.treatmentPlanTitle}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.treatmentPlanTitlePlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packageProcedure}</label>
            <select
              value={procedureId}
              onChange={(e) => setProcedureId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.allServicesPackage}</option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.expectedSessions}</label>
            <input
              value={expectedSessions}
              onChange={(e) => setExpectedSessions(e.target.value)}
              inputMode="numeric"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.cadenceDays}</label>
            <input
              value={cadenceDays}
              onChange={(e) => setCadenceDays(e.target.value)}
              inputMode="numeric"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.targetStart}</label>
            <input
              type="date"
              value={targetStartAt}
              onChange={(e) => setTargetStartAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.targetEnd}</label>
            <input
              type="date"
              value={targetEndAt}
              onChange={(e) => setTargetEndAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.treatmentGoals}</label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.treatmentPlanNextSteps}</label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.photoMilestones}</label>
          <textarea
            value={photoMilestones}
            onChange={(e) => setPhotoMilestones(e.target.value)}
            rows={2}
            placeholder={t.photoMilestonesPlaceholder}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto min-h-11 px-5 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-60"
        >
          {saving ? t.savingEllipsis : t.saveTreatmentPlan}
        </button>
      </form>

      <div className="space-y-3">
        {plans.length === 0 ? (
          <ClinicEmptyState title={t.noTreatmentPlansYet} />
        ) : (
          plans.map((plan) => {
            const progress = treatmentPlanProgress(plan)
            const milestones = Array.isArray(plan.photoMilestones) ? plan.photoMilestones : []
            return (
              <article key={plan.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          plan.status === 'ACTIVE'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {treatmentPlanStatusLabel(t, plan.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {plan.procedure?.name ?? t.allServicesPackage} · {plan.cadenceDays} {t.daysAbbr}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {plan.targetStartAt
                        ? new Date(plan.targetStartAt).toLocaleDateString(dateLocale)
                        : t.emptyValue}
                      {' -> '}
                      {plan.targetEndAt
                        ? new Date(plan.targetEndAt).toLocaleDateString(dateLocale)
                        : t.emptyValue}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      {progress.completed}/{progress.expected}
                    </p>
                    <p className="text-xs text-gray-500">{t.sessionsCompleted}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${progress.percent}%` }} />
                </div>
                {plan.goals && <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{plan.goals}</p>}
                {plan.nextSteps && (
                  <p className="mt-2 rounded-xl bg-purple-50 p-3 text-sm text-purple-900">
                    {plan.nextSteps}
                  </p>
                )}
                {milestones.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.photoMilestones}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {milestones.map((milestone, index) => (
                        <span key={`${milestone.title}-${index}`} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                          {milestone.targetSession ? `${milestone.targetSession}: ` : ''}
                          {milestone.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {plan.visits.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.linkedVisits}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {plan.visits.slice(0, 5).map((visit) => (
                        <p key={visit.id}>
                          {new Date(visit.visitAt).toLocaleDateString(dateLocale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {visit.status}
                          {visit.media.length > 0 ? ` · ${visit.media.length} ${t.photos}` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.status !== 'PAUSED' && (
                    <button
                      type="button"
                      disabled={busyPlanId === plan.id}
                      onClick={() => updateStatus(plan.id, 'PAUSED')}
                      className="min-h-10 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 disabled:opacity-60"
                    >
                      {t.pausePlan}
                    </button>
                  )}
                  {plan.status !== 'ACTIVE' && (
                    <button
                      type="button"
                      disabled={busyPlanId === plan.id}
                      onClick={() => updateStatus(plan.id, 'ACTIVE')}
                      className="min-h-10 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 disabled:opacity-60"
                    >
                      {t.activatePlan}
                    </button>
                  )}
                  {plan.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={busyPlanId === plan.id}
                      onClick={() => updateStatus(plan.id, 'COMPLETED')}
                      className="min-h-10 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 disabled:opacity-60"
                    >
                      {t.completePlan}
                    </button>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

function PackagesTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [procedures, setProcedures] = useState<Array<{ id: string; name: string; basePriceCents: number; currency: string }>>([])
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [name, setName] = useState('')
  const [procedureId, setProcedureId] = useState('')
  const [totalSessions, setTotalSessions] = useState('5')
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [discountRuleId, setDiscountRuleId] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [paymentStatus, setPaymentStatus] = useState('PAID')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [res, discountRes] = await Promise.all([
        fetch('/api/clinic/procedures', { credentials: 'include' }),
        fetch('/api/clinic/discount-rules', { credentials: 'include' }),
      ])
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setProcedures((data.procedures || []).filter((procedure: { active: boolean }) => procedure.active))
        if (discountRes.ok) {
          const discountData = await discountRes.json()
          setDiscountRules((discountData.rules || []).filter((rule: DiscountRule) => rule.active))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sessions = Number.parseInt(totalSessions, 10)
    const major = Number.parseFloat(price || '0')
    const discountMajor = Number.parseFloat(discount || '0')
    if (!name.trim()) {
      alert(t.packageNameRequired)
      return
    }
    if (!Number.isFinite(sessions) || sessions <= 0) {
      alert(t.packageSessionsRequired)
      return
    }
    if (!Number.isFinite(major) || major < 0) {
      alert(t.enterValidAmount)
      return
    }
    if (!Number.isFinite(discountMajor) || discountMajor < 0) {
      alert(t.enterValidAmount)
      return
    }
    if (discountMajor > 0 && !discountReason.trim()) {
      alert(t.discountReasonRequired)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          procedureId: procedureId || null,
          totalSessions: sessions,
          priceCents: Math.round(major * 100),
          discountCents: Math.round(discountMajor * 100),
          discountRuleId: discountRuleId || null,
          discountReason: discountReason.trim() || null,
          currency: 'AED',
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          paymentMethod,
          paymentStatus,
          note: note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setName('')
      setProcedureId('')
      setTotalSessions('5')
      setPrice('')
      setDiscount('')
      setDiscountRuleId('')
      setDiscountReason('')
      setExpiresAt('')
      setNote('')
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const sortedPackages = [...patient.packages].sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
    return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
  })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.treatmentPackages}</p>
        <h2 className="mt-1 text-xl font-semibold text-emerald-950">{t.sellPackage}</h2>
        <p className="mt-1 text-sm text-emerald-800">{t.packageHint}</p>
      </section>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packageName}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.packageNamePlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packageProcedure}</label>
            <select
              value={procedureId}
              onChange={(e) => setProcedureId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.allServicesPackage}</option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packageSessions}</label>
            <input
              value={totalSessions}
              onChange={(e) => setTotalSessions(e.target.value)}
              inputMode="numeric"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packagePrice}</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="1500"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.discountRuleOptional}</label>
            <select
              value={discountRuleId}
              onChange={(e) => {
                const ruleId = e.target.value
                setDiscountRuleId(ruleId)
                const rule = discountRules.find((item) => item.id === ruleId)
                const baseCents = Math.round(Number.parseFloat(price || '0') * 100)
                const calculated = calculateDiscountFromRule(baseCents, rule)
                if (calculated > 0) setDiscount((calculated / 100).toFixed(2))
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.noDiscountRule}</option>
              {discountRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.paymentDiscount}</label>
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.discountReason}</label>
            <input
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              placeholder={t.discountReasonPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packageExpiresAt}</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.paymentMethod}</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="CARD">{t.payMethodCard}</option>
              <option value="CASH">{t.payMethodCash}</option>
              <option value="TRANSFER">{t.payMethodTransfer}</option>
              <option value="POS">{t.payMethodPos}</option>
              <option value="STRIPE">{t.payMethodStripe}</option>
              <option value="OTHER">{t.payMethodOther}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.packagePaymentStatus}</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="PAID">{t.payStatusPaid}</option>
            <option value="PENDING">{t.payStatusPending}</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">{t.packageSaleCreatesPayment}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.note}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto min-h-11 px-5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
        >
          {saving ? t.savingEllipsis : t.savePackage}
        </button>
      </form>

      <div className="space-y-3">
        {sortedPackages.length === 0 ? (
          <ClinicEmptyState title={t.noPackagesYet} />
        ) : (
          sortedPackages.map((item) => {
            const oneLeft = item.status === 'ACTIVE' && item.remainingSessions === 1
            return (
              <article key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {packageStatusLabel(t, item.status)}
                      </span>
                      {oneLeft && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          {t.oneSessionLeft}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.procedure?.name ?? t.allServicesPackage} · {formatMoney(item.priceCents, item.currency)}
                    </p>
                    {item.discountCents > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        {t.discountTotal}: {formatMoney(item.discountCents, item.currency)} ·{' '}
                        {item.discountName ?? t.manualDiscount}
                        {item.discountReason ? ` · ${item.discountReason}` : ''}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {t.packagePurchased}:{' '}
                      {new Date(item.purchasedAt).toLocaleDateString(dateLocale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {item.expiresAt
                        ? `${t.packageExpires}: ${new Date(item.expiresAt).toLocaleDateString(dateLocale)}`
                        : t.packageNoExpiry}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      {item.remainingSessions}/{item.totalSessions}
                    </p>
                    <p className="text-xs text-gray-500">{t.packageRemaining}</p>
                  </div>
                </div>
                {item.redemptions.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.packageUsed}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {item.redemptions.slice(0, 5).map((redemption) => (
                        <p key={redemption.id}>
                          {new Date(redemption.redeemedAt).toLocaleDateString(dateLocale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {redemption.sessionsDelta}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

function ConsentsTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [templates, setTemplates] = useState<ConsentTemplateRow[]>([])
  const [procedures, setProcedures] = useState<Array<{ id: string; name: string }>>([])
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [templateProcedureId, setTemplateProcedureId] = useState('')
  const [templateContraindications, setTemplateContraindications] = useState('')
  const [aftercareText, setAftercareText] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [visitId, setVisitId] = useState('')
  const [signatureName, setSignatureName] = useState(
    [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ')
  )
  const [accepted, setAccepted] = useState(false)
  const [aftercareAcknowledged, setAftercareAcknowledged] = useState(false)
  const [note, setNote] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [savingConsent, setSavingConsent] = useState(false)

  const loadTemplates = useCallback(async () => {
    const res = await fetch('/api/clinic/consents/templates', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    setTemplates(data.templates || [])
  }, [])

  useEffect(() => {
    let cancelled = false
    loadTemplates()
    ;(async () => {
      const res = await fetch('/api/clinic/procedures', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setProcedures((data.procedures || []).filter((procedure: { active: boolean }) => procedure.active))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadTemplates])

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId)

  const createTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateTitle.trim() || !templateBody.trim()) {
      alert(t.consentTemplateRequired)
      return
    }
    setSavingTemplate(true)
    try {
      const res = await fetch('/api/clinic/consents/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: templateTitle.trim(),
          body: templateBody.trim(),
          procedureId: templateProcedureId || null,
          contraindications: templateContraindications
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          aftercareText: aftercareText.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setTemplateTitle('')
      setTemplateBody('')
      setTemplateProcedureId('')
      setTemplateContraindications('')
      setAftercareText('')
      await loadTemplates()
      setSelectedTemplateId(data.template?.id || '')
    } finally {
      setSavingTemplate(false)
    }
  }

  const signConsent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) {
      alert(t.consentTemplateRequired)
      return
    }
    if (!accepted || !signatureName.trim()) {
      alert(t.consentSignatureRequired)
      return
    }
    setSavingConsent(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          visitId: visitId || null,
          checkedItems,
          patientNameSnapshot: signatureName.trim(),
          signatureText: signatureName.trim(),
          accepted: true,
          aftercareAcknowledged,
          note: note.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setCheckedItems([])
      setVisitId('')
      setAccepted(false)
      setAftercareAcknowledged(false)
      setNote('')
      await onRefresh()
    } finally {
      setSavingConsent(false)
    }
  }

  const toggleCheckedItem = (item: string) => {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{t.consentForms}</p>
        <h2 className="mt-1 text-xl font-semibold text-blue-950">{t.signConsent}</h2>
        <p className="mt-1 text-sm text-blue-800">{t.consentHint}</p>
      </section>

      <form onSubmit={createTemplate} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.consentTemplateLibrary}</p>
          <h3 className="text-lg font-semibold text-gray-900">{t.createConsentTemplate}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.consentTemplateTitle}</label>
            <input
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.packageProcedure}</label>
            <select
              value={templateProcedureId}
              onChange={(e) => setTemplateProcedureId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.allServicesPackage}</option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.consentTemplateBody}</label>
          <textarea
            value={templateBody}
            onChange={(e) => setTemplateBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.contraindications}</label>
          <textarea
            value={templateContraindications}
            onChange={(e) => setTemplateContraindications(e.target.value)}
            rows={3}
            placeholder={t.contraindicationsPlaceholder}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
          <p className="mt-1 text-xs text-gray-500">{t.contraindicationsHint}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.aftercareText}</label>
          <textarea
            value={aftercareText}
            onChange={(e) => setAftercareText(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={savingTemplate}
          className="w-full sm:w-auto min-h-11 px-5 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {savingTemplate ? t.savingEllipsis : t.saveTemplate}
        </button>
      </form>

      <form onSubmit={signConsent} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.signConsent}</h3>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.consentTemplate}</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value)
              setCheckedItems([])
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="">{templates.length ? t.selectPlaceholder : t.noConsentTemplates}</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
                {template.procedure ? ` · ${template.procedure.name}` : ''}
              </option>
            ))}
          </select>
        </div>
        {selectedTemplate && (
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 space-y-3">
            <p className="font-semibold text-gray-900">{selectedTemplate.title}</p>
            <p className="whitespace-pre-wrap">{selectedTemplate.body}</p>
            {selectedTemplate.contraindications.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t.reviewedContraindications}
                </p>
                <div className="mt-2 space-y-2">
                  {selectedTemplate.contraindications.map((item) => (
                    <label key={item} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(item)}
                        onChange={() => toggleCheckedItem(item)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.linkToVisitOptional}</label>
            <select
              value={visitId}
              onChange={(e) => setVisitId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.emptyValue}</option>
              {patient.visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {new Date(visit.visitAt).toLocaleString(dateLocale, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.patientSignatureName}</label>
            <input
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span>{t.patientAcceptedConsent}</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={aftercareAcknowledged}
            onChange={(e) => setAftercareAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span>{t.aftercareAcknowledged}</span>
        </label>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.note}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <p className="text-xs text-gray-500">{t.consentPatientSafeExportHint}</p>
        <button
          type="submit"
          disabled={savingConsent || !selectedTemplate}
          className="w-full sm:w-auto min-h-11 px-5 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {savingConsent ? t.savingEllipsis : t.saveSignedConsent}
        </button>
      </form>

      <div className="space-y-3">
        {patient.consentRecords.length === 0 ? (
          <ClinicEmptyState title={t.noConsentsYet} />
        ) : (
          patient.consentRecords.map((consent) => (
            <article key={consent.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{consent.templateTitleSnapshot}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {consent.procedure?.name ?? t.allServicesPackage}
                    {consent.visit
                      ? ` · ${t.consentLinkedVisit}: ${new Date(consent.visit.visitAt).toLocaleDateString(dateLocale)}`
                      : ''}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                  {consent.acceptedAt
                    ? `${t.consentAcceptedAt}: ${new Date(consent.acceptedAt).toLocaleDateString(dateLocale)}`
                    : t.notLinked}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{consent.templateBodySnapshot}</p>
              {consent.contraindicationsSnapshot.length > 0 && (
                <p className="mt-3 text-xs text-gray-500">
                  {t.reviewedContraindications}: {consent.checkedItems.join(', ') || t.emptyValue}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {t.patientSignatureName}: {consent.signatureText || consent.patientNameSnapshot}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

type QuoteDraftLine = {
  procedureId: string
  description: string
  quantity: string
  unitPrice: string
}

function defaultQuoteValidUntil() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

function quoteStatusLabel(t: ReturnType<typeof useClinicLocale>['t'], status: PriceQuoteRow['status']) {
  if (status === 'SENT') return t.quoteStatusSent
  if (status === 'ACCEPTED') return t.quoteStatusAccepted
  if (status === 'DECLINED') return t.quoteStatusDeclined
  if (status === 'EXPIRED') return t.quoteStatusExpired
  return t.quoteStatusDraft
}

function quoteStatusClass(status: PriceQuoteRow['status']) {
  if (status === 'ACCEPTED') return 'bg-emerald-100 text-emerald-800'
  if (status === 'SENT') return 'bg-blue-100 text-blue-800'
  if (status === 'DECLINED' || status === 'EXPIRED') return 'bg-gray-100 text-gray-700'
  return 'bg-orange-100 text-orange-800'
}

function patientWhatsAppUrl(patient: PatientRecord, text: string) {
  const digits = (patient.phone || '').replace(/\D/g, '')
  const encoded = encodeURIComponent(text)
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}

function quoteMessage(practiceName: string, patient: PatientRecord, quote: PriceQuoteRow) {
  return buildPriceQuoteMessage({
    practiceName,
    patientName: [patient.firstName, patient.lastName].filter(Boolean).join(' '),
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    currency: quote.currency,
    subtotalCents: quote.subtotalCents,
    discountCents: quote.discountCents,
    totalCents: quote.totalCents,
    validUntil: quote.validUntil,
    lines: quote.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      totalCents: line.totalCents,
    })),
  })
}

function PriceQuotesTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [procedures, setProcedures] = useState<QuoteProcedureOption[]>([])
  const [title, setTitle] = useState(t.quoteDefaultTitle)
  const [validUntil, setValidUntil] = useState(defaultQuoteValidUntil)
  const [discount, setDiscount] = useState('')
  const [note, setNote] = useState('')
  const [terms, setTerms] = useState(t.quoteDefaultTerms)
  const [lines, setLines] = useState<QuoteDraftLine[]>([
    { procedureId: '', description: '', quantity: '1', unitPrice: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/clinic/procedures', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setProcedures(
          ((data.procedures || []) as QuoteProcedureOption[]).filter((procedure) => procedure.active)
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const draftTotals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const quantity = Math.max(1, Math.round(Number(line.quantity) || 1))
      const unitPriceCents = Math.max(0, Math.round((Number.parseFloat(line.unitPrice || '0') || 0) * 100))
      return sum + quantity * unitPriceCents
    }, 0)
    const discountCents = Math.min(
      subtotal,
      Math.max(0, Math.round((Number.parseFloat(discount || '0') || 0) * 100))
    )
    return { subtotal, discountCents, total: Math.max(0, subtotal - discountCents) }
  }, [discount, lines])

  const updateLine = (index: number, patch: Partial<QuoteDraftLine>) => {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  const chooseProcedure = (index: number, procedureId: string) => {
    const procedure = procedures.find((item) => item.id === procedureId)
    updateLine(index, {
      procedureId,
      description: procedure?.name ?? lines[index]?.description ?? '',
      unitPrice: procedure ? (procedure.basePriceCents / 100).toFixed(2) : lines[index]?.unitPrice ?? '',
    })
  }

  const addLine = () => {
    setLines((current) => [
      ...current,
      { procedureId: '', description: '', quantity: '1', unitPrice: '' },
    ])
  }

  const removeLine = (index: number) => {
    setLines((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)))
  }

  const createQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    const payloadLines = lines
      .map((line) => ({
        procedureId: line.procedureId || null,
        description: line.description.trim(),
        quantity: Math.max(1, Math.round(Number(line.quantity) || 1)),
        unitPriceCents: Math.max(0, Math.round((Number.parseFloat(line.unitPrice || '0') || 0) * 100)),
      }))
      .filter((line) => line.description)
    if (payloadLines.length === 0) {
      alert(t.quoteLineRequired)
      return
    }
    setSaving(true)
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          validUntil: validUntil || null,
          discountCents: draftTotals.discountCents,
          currency: 'AED',
          note: note || null,
          terms: terms || null,
          lines: payloadLines,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setLines([{ procedureId: '', description: '', quantity: '1', unitPrice: '' }])
      setDiscount('')
      setNote('')
      setValidUntil(defaultQuoteValidUntil())
      setNotice(t.quoteCreated)
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const copyQuoteText = async (quote: PriceQuoteRow) => {
    const text = quoteMessage('your practitioner', patient, quote)
    await navigator.clipboard.writeText(text)
    setNotice(t.quoteTextCopied)
  }

  const markQuoteSent = async (quote: PriceQuoteRow) => {
    await fetch(`/api/clinic/patients/${patient.id}/quotes/${quote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'SENT' }),
    })
    await onRefresh()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createQuote} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.createPriceQuote}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.createPriceQuoteHint}</p>
          </div>
          <Send className="h-5 w-5 shrink-0 text-orange-500" />
        </div>

        {notice && (
          <ClinicAlert variant="success" role="status" className="mt-4">
            {notice}
          </ClinicAlert>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{t.quoteTitle}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{t.quoteValidUntil}</span>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
            />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <div className="grid gap-3 sm:grid-cols-[1.2fr_1.5fr_0.6fr_0.8fr_auto] sm:items-end">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">{t.service}</span>
                  <select
                    value={line.procedureId}
                    onChange={(e) => chooseProcedure(index, e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">{t.customLine}</option>
                    {procedures.map((procedure) => (
                      <option key={procedure.id} value={procedure.id}>
                        {procedure.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">{t.quoteLineDescription}</span>
                  <input
                    value={line.description}
                    onChange={(e) => updateLine(index, { description: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">{t.quantity}</span>
                  <input
                    value={line.quantity}
                    onChange={(e) => updateLine(index, { quantity: e.target.value })}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">{t.unitPrice}</span>
                  <input
                    value={line.unitPrice}
                    onChange={(e) => updateLine(index, { unitPrice: e.target.value })}
                    inputMode="decimal"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  disabled={lines.length === 1}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-white disabled:opacity-40"
                >
                  {t.removeMaterial}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLine}
            className="rounded-xl border border-dashed border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
          >
            {t.addQuoteLine}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{t.quoteDiscount}</span>
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
            />
          </label>
          <div className="rounded-2xl bg-orange-50 p-4 text-sm">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <strong>{formatMoney(draftTotals.subtotal, 'AED')}</strong>
            </div>
            <div className="mt-1 flex justify-between">
              <span>{t.discount}</span>
              <strong>{formatMoney(draftTotals.discountCents, 'AED')}</strong>
            </div>
            <div className="mt-2 flex justify-between text-base text-orange-950">
              <span>{t.estimatedTotal}</span>
              <strong>{formatMoney(draftTotals.total, 'AED')}</strong>
            </div>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm text-gray-600">{t.quoteNote}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm text-gray-600">{t.quoteTerms}</span>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-gray-900 py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {saving ? t.savingEllipsis : t.saveQuote}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{t.savedQuotes}</h2>
        {patient.priceQuotes.length === 0 ? (
          <ClinicEmptyState title={t.noQuotesYet} />
        ) : (
          patient.priceQuotes.map((quote) => {
            const text = quoteMessage('your practitioner', patient, quote)
            const mailSubject = encodeURIComponent(`${quote.title} ${quote.quoteNumber}`)
            const mailBody = encodeURIComponent(text)
            return (
              <article key={quote.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{quote.title}</p>
                      <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', quoteStatusClass(quote.status))}>
                        {quoteStatusLabel(t, quote.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {quote.quoteNumber} ·{' '}
                      {new Date(quote.createdAt).toLocaleDateString(dateLocale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {quote.validUntil
                        ? ` · ${t.quoteValidUntil}: ${new Date(quote.validUntil).toLocaleDateString(dateLocale)}`
                        : ''}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-gray-950">
                    {formatMoney(quote.totalCents, quote.currency)}
                  </p>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  {quote.lines.map((line) => (
                    <div key={line.id} className="flex justify-between gap-3">
                      <span>
                        {line.description}
                        {line.quantity > 1 ? ` x${line.quantity}` : ''}
                      </span>
                      <span className="font-medium">{formatMoney(line.totalCents, quote.currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`/api/clinic/patients/${patient.id}/quotes/${quote.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <FileDown className="h-4 w-4" />
                    {t.downloadQuotePdf}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyQuoteText(quote)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    {t.copyQuoteText}
                  </button>
                  <a
                    href={patientWhatsAppUrl(patient, text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => void markQuoteSent(quote)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                    {t.shareWhatsApp}
                  </a>
                  <a
                    href={`mailto:${patient.email || ''}?subject=${mailSubject}&body=${mailBody}`}
                    onClick={() => void markQuoteSent(quote)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t.shareEmail}
                  </a>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

function PaymentsTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [amount, setAmount] = useState('')
  const [discount, setDiscount] = useState('')
  const [discountRuleId, setDiscountRuleId] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [method, setMethod] = useState('CARD')
  const [status, setStatus] = useState('PAID')
  const [note, setNote] = useState('')
  const [visitId, setVisitId] = useState('')
  const [saving, setSaving] = useState(false)
  const [giftCardCode, setGiftCardCode] = useState('')
  const [giftCardAmount, setGiftCardAmount] = useState('')
  const [giftCardVisitId, setGiftCardVisitId] = useState('')
  const [giftCardNote, setGiftCardNote] = useState('')
  const [redeemingGiftCard, setRedeemingGiftCard] = useState(false)
  const [correctingId, setCorrectingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/clinic/discount-rules', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) setDiscountRules((data.rules || []).filter((rule: DiscountRule) => rule.active))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const major = Number.parseFloat(amount)
    if (Number.isNaN(major) || major <= 0) {
      alert(t.enterValidAmount)
      return
    }
    const amountCents = Math.round(major * 100)
    const discountMajor = Number.parseFloat(discount || '0')
    if (!Number.isFinite(discountMajor) || discountMajor < 0) {
      alert(t.enterValidAmount)
      return
    }
    const discountCents = Math.round(discountMajor * 100)
    if (discountCents > 0 && !discountReason.trim()) {
      alert(t.discountReasonRequired)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amountCents,
          discountCents,
          discountRuleId: discountRuleId || null,
          discountReason: discountReason.trim() || null,
          currency: 'AED',
          method,
          status,
          note: note || null,
          visitId: visitId || null,
          paidAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setAmount('')
      setDiscount('')
      setDiscountRuleId('')
      setDiscountReason('')
      setNote('')
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const updatePaymentStatus = async (payment: PaymentRow, nextStatus: 'REFUNDED' | 'VOID') => {
    const remainingRefundable = paymentRefundableCents(payment)
    const reason = window.prompt(
      nextStatus === 'REFUNDED' ? t.paymentRefundReasonPrompt : t.paymentVoidReasonPrompt
    )
    if (!reason?.trim()) {
      alert(t.paymentCorrectionReasonRequired)
      return
    }
    const amountInput =
      nextStatus === 'REFUNDED'
        ? window.prompt(t.paymentRefundAmountPrompt, (remainingRefundable / 100).toFixed(2))
        : null
    const amountCents =
      nextStatus === 'REFUNDED'
        ? Math.round(Number.parseFloat(amountInput || '') * 100)
        : payment.amountCents
    if (nextStatus === 'REFUNDED' && (!Number.isInteger(amountCents) || amountCents <= 0)) {
      alert(t.enterValidAmount)
      return
    }

    setCorrectingId(payment.id)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/payments/${payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: nextStatus,
          reason,
          amountCents: nextStatus === 'REFUNDED' ? amountCents : undefined,
          method: payment.method,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      await onRefresh()
    } finally {
      setCorrectingId(null)
    }
  }

  const redeemGiftCard = async (e: React.FormEvent) => {
    e.preventDefault()
    const major = Number.parseFloat(giftCardAmount)
    if (Number.isNaN(major) || major <= 0) {
      alert(t.enterValidAmount)
      return
    }
    if (!giftCardCode.trim()) {
      alert(t.giftCardCodeRequired)
      return
    }
    setRedeemingGiftCard(true)
    try {
      const res = await fetch('/api/clinic/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: patient.id,
          code: giftCardCode,
          amountCents: Math.round(major * 100),
          visitId: giftCardVisitId || null,
          note: giftCardNote || null,
          redeemedAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setGiftCardCode('')
      setGiftCardAmount('')
      setGiftCardVisitId('')
      setGiftCardNote('')
      await onRefresh()
    } finally {
      setRedeemingGiftCard(false)
    }
  }

  return (
    <div className="space-y-6">
      <BalanceSummaryCard balance={patient.clientBalance} />

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.recordPayment}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.amountAed}</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder={t.amountPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.discountRuleOptional}</label>
            <select
              value={discountRuleId}
              onChange={(e) => {
                const ruleId = e.target.value
                setDiscountRuleId(ruleId)
                const rule = discountRules.find((item) => item.id === ruleId)
                const baseCents = Math.round(Number.parseFloat(amount || '0') * 100)
                const calculated = calculateDiscountFromRule(baseCents, rule)
                if (calculated > 0) setDiscount((calculated / 100).toFixed(2))
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.noDiscountRule}</option>
              {discountRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.paymentMethod}</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="CARD">{t.payMethodCard}</option>
              <option value="CASH">{t.payMethodCash}</option>
              <option value="TRANSFER">{t.payMethodTransfer}</option>
              <option value="POS">{t.payMethodPos}</option>
              <option value="STRIPE">{t.payMethodStripe}</option>
              <option value="OTHER">{t.payMethodOther}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.paymentDiscount}</label>
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.discountReason}</label>
          <input
            value={discountReason}
            onChange={(e) => setDiscountReason(e.target.value)}
            placeholder={t.discountReasonPlaceholder}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.paymentStatusLabel}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="PAID">{t.payStatusPaid}</option>
            <option value="PENDING">{t.payStatusPending}</option>
            <option value="REFUNDED">{t.payStatusRefunded}</option>
            <option value="VOID">{t.payStatusVoid}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.linkToVisitOptional}</label>
          <select
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="">{t.emptyValue}</option>
            {patient.visits.map((v) => (
              <option key={v.id} value={v.id}>
                {new Date(v.visitAt).toLocaleString(dateLocale, {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.note}</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
        >
          {saving ? t.savingEllipsis : t.addPayment}
        </button>
      </form>

      <form onSubmit={redeemGiftCard} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t.redeemGiftCard}</h2>
          <p className="mt-1 text-sm text-gray-500">{t.giftCardRedemptionHint}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.giftCardCode}</label>
            <input
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value)}
              placeholder="GC-..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.giftCardAmountToRedeem}</label>
            <input
              value={giftCardAmount}
              onChange={(e) => setGiftCardAmount(e.target.value)}
              inputMode="decimal"
              placeholder={t.amountPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.linkToVisitOptional}</label>
            <select
              value={giftCardVisitId}
              onChange={(e) => setGiftCardVisitId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.emptyValue}</option>
              {patient.visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {new Date(v.visitAt).toLocaleString(dateLocale, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.note}</label>
            <input
              value={giftCardNote}
              onChange={(e) => setGiftCardNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={redeemingGiftCard}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
        >
          {redeemingGiftCard ? t.savingEllipsis : t.redeemGiftCard}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.giftCardRedemptions}</h2>
        </div>
        {patient.giftCardRedemptions.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t.noGiftCardRedemptions}</p>
        ) : (
          patient.giftCardRedemptions.map((redemption) => (
            <div key={redemption.id} className="p-4 text-sm flex justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {formatMoney(redemption.amountCents, redemption.currency)} · {redemption.giftCard.code}
                </p>
                <p className="text-gray-600">
                  {t.giftCardSoldBy}: {redemption.giftCard.buyerName}
                  {redemption.giftCard.recipientName ? ` · ${t.giftCardRecipient}: ${redemption.giftCard.recipientName}` : ''}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t.giftCardBalance}: {formatMoney(redemption.giftCard.remainingBalanceCents, redemption.currency)}
                </p>
                {redemption.note && <p className="text-gray-500 text-xs mt-1">{redemption.note}</p>}
              </div>
              <p className="text-gray-400 text-xs shrink-0">
                {new Date(redemption.redeemedAt).toLocaleDateString(dateLocale)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.productSales}</h2>
          <p className="mt-1 text-sm text-gray-500">{t.productSalesPatientHistoryHint}</p>
        </div>
        {patient.productSales.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t.noProductSalesYet}</p>
        ) : (
          patient.productSales.map((sale) => (
            <div key={sale.id} className="p-4 text-sm flex justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {formatMoney(sale.totalCents, sale.currency)} · {sale.paymentStatus}
                </p>
                <p className="text-gray-600">
                  {sale.lines.map((line) => `${line.stockItem.name} × ${line.quantity}`).join(', ')}
                </p>
                {sale.discountCents > 0 && (
                  <p className="text-xs text-gray-500">
                    {t.paymentDiscount}: {formatMoney(sale.discountCents, sale.currency)}
                  </p>
                )}
                {sale.note && <p className="text-gray-500 text-xs mt-1">{sale.note}</p>}
              </div>
              <p className="text-gray-400 text-xs shrink-0">
                {new Date(sale.soldAt).toLocaleDateString(dateLocale)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {patient.payments.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t.noPaymentsRecorded}</p>
        ) : (
          patient.payments.map((pmt) => (
            <div key={pmt.id} className="p-4 text-sm flex justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {formatMoney(pmt.amountCents, pmt.currency)}
                </p>
                <p className="text-gray-600">
                  {pmt.method} · {pmt.status}
                </p>
                {pmt.processorFeeCents > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    {t.paymentProcessorFee}: {formatMoney(pmt.processorFeeCents, pmt.currency)}
                  </p>
                )}
                {pmt.discountCents > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    {t.discountTotal}: {formatMoney(pmt.discountCents, pmt.currency)} ·{' '}
                    {pmt.discountName ?? t.manualDiscount}
                    {pmt.discountReason ? ` · ${pmt.discountReason}` : ''}
                  </p>
                )}
                {(pmt.correctionsAsOriginal?.length ?? 0) > 0 && (
                  <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                    <p className="font-semibold text-gray-700">{t.paymentCorrectionHistory}</p>
                    {pmt.correctionsAsOriginal?.map((correction) => (
                      <p key={correction.id}>
                        {correction.type === 'REFUND' ? t.refundPayment : t.voidPayment}:{' '}
                        {formatMoney(correction.amountCents, correction.currency)} · {correction.method} ·{' '}
                        {correction.reason}
                      </p>
                    ))}
                  </div>
                )}
                {pmt.note && <p className="text-gray-500 text-xs mt-1">{pmt.note}</p>}
                {pmt.status === 'PAID' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updatePaymentStatus(pmt, 'REFUNDED')}
                      disabled={correctingId === pmt.id || paymentRefundableCents(pmt) <= 0}
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-60"
                    >
                      {t.refundPayment}
                      {paymentRefundableCents(pmt) > 0
                        ? ` (${formatMoney(paymentRefundableCents(pmt), pmt.currency)})`
                        : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentStatus(pmt, 'VOID')}
                      disabled={correctingId === pmt.id || paymentRefundedCents(pmt) > 0}
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-60"
                    >
                      {t.voidPayment}
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-xs shrink-0">
                {new Date(pmt.paidAt).toLocaleDateString(dateLocale)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CrmTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [type, setType] = useState('NOTE')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const speechWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
    }
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition))
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  const appendTranscript = useCallback((text: string) => {
    const clean = text.trim()
    if (!clean) return
    setBody((current) => {
      const separator = current.trim() ? ' ' : ''
      return `${current.trim()}${separator}${clean}`
    })
  }, [])

  const toggleVoiceInput = () => {
    setVoiceError(null)
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (typeof window === 'undefined') return
    const speechWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
    }
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setVoiceSupported(false)
      setVoiceError(t.voiceCommentUnsupported)
      return
    }

    const recognition = new Recognition()
    recognition.lang = locale === 'ru' ? 'ru-RU' : 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i]?.[0]?.transcript ?? ''
        if (event.results[i]?.isFinal) finalText += transcript
        else interimText += transcript
      }
      if (finalText) appendTranscript(finalText)
      setInterimTranscript(interimText.trim())
    }
    recognition.onerror = () => {
      setVoiceError(t.voiceCommentError)
      setIsListening(false)
      setInterimTranscript('')
    }
    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    setType('NOTE')
    setIsListening(true)
    recognition.start()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          body: body.trim(),
          occurredAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || t.operationFailed)
        return
      }
      setBody('')
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const messageActivities = patient.crmActivities.filter((activity) =>
    ['WHATSAPP', 'EMAIL'].includes(activity.type)
  )

  const crmTypeLabel = (activityType: string) => {
    switch (activityType) {
      case 'CALL':
        return t.crmTypeCall
      case 'EMAIL':
        return t.crmTypeEmail
      case 'WHATSAPP':
        return t.crmTypeWhatsapp
      case 'FOLLOW_UP':
        return t.crmTypeFollowUp
      case 'OTHER':
        return t.crmTypeOther
      case 'NOTE':
      default:
        return t.crmTypeNote
    }
  }

  const activityTimestamp = (activity: CrmRow) =>
    new Date(activity.occurredAt).toLocaleString(dateLocale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t.logInteraction}</h2>
          <p className="mt-1 text-sm text-gray-500">{t.voiceCommentHint}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.crmTypeLabel}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="NOTE">{t.crmTypeNote}</option>
            <option value="CALL">{t.crmTypeCall}</option>
            <option value="WHATSAPP">{t.crmTypeWhatsapp}</option>
            <option value="EMAIL">{t.crmTypeEmail}</option>
            <option value="FOLLOW_UP">{t.crmTypeFollowUp}</option>
            <option value="OTHER">{t.crmTypeOther}</option>
          </select>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <label className="block text-sm text-gray-600">{t.crmDetails}</label>
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={!voiceSupported}
              className={clsx(
                'inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold disabled:opacity-50',
                isListening
                  ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                  : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
              {isListening ? t.voiceCommentStop : t.voiceCommentStart}
            </button>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            placeholder={t.crmDetailsPlaceholder}
          />
          {interimTranscript && (
            <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {t.voiceCommentListening}: {interimTranscript}
            </p>
          )}
          {!voiceSupported && (
            <p className="mt-2 text-xs text-gray-500">{t.voiceCommentUnsupported}</p>
          )}
          {voiceError && <p className="mt-2 text-xs text-red-600">{voiceError}</p>}
        </div>
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-50"
        >
          {saving ? t.savingEllipsis : t.saveToCrm}
        </button>
      </form>

      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.messageHistory}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.messageHistoryHint}</p>
          </div>
        </div>
        <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {messageActivities.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{t.noMessageHistory}</p>
          ) : (
            messageActivities.map((activity) => (
              <div key={activity.id} className="p-4 text-sm">
                <p className="font-medium text-gray-900">
                  {crmTypeLabel(activity.type)}{' '}
                  <span className="text-gray-400 font-normal text-xs">
                    {activityTimestamp(activity)}
                  </span>
                </p>
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{activity.body}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {patient.crmActivities.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t.noCrmHistory}</p>
        ) : (
          patient.crmActivities.map((c) => (
            <div key={c.id} className="p-4 text-sm">
              <p className="font-medium text-gray-900">
                {crmTypeLabel(c.type)}{' '}
                <span className="text-gray-400 font-normal text-xs">
                  {activityTimestamp(c)}
                </span>
              </p>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
