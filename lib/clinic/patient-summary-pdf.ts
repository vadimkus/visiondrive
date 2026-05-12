import jsPDF from 'jspdf'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ClinicAnamnesisV1 } from '@/lib/clinic/anamnesis'

const PDF_FONT = 'NotoSans'
const BRAND: [number, number, number] = [37, 99, 235]
const BRAND_DARK: [number, number, number] = [30, 64, 175]
const INK: [number, number, number] = [17, 24, 39]
const MUTED: [number, number, number] = [100, 116, 139]
const LINE: [number, number, number] = [226, 232, 240]
const PANEL: [number, number, number] = [248, 250, 252]
const WARNING: [number, number, number] = [255, 149, 0]

export type ClinicPatientSummaryPdfAppointment = {
  startsAt: Date
  /** Display line only — procedure name, title, or generic label */
  label: string
}

export type ClinicPatientSummaryPdfVisitDate = {
  visitAt: Date
}

export type BuildClinicPatientSummaryPdfInput = {
  practiceName: string
  generatedAt: Date
  locale?: 'en' | 'ru'
  patient: {
    firstName: string
    lastName: string
    middleName: string | null
    dateOfBirth: Date | null
    phone: string | null
    email: string | null
  }
  anamnesis: ClinicAnamnesisV1
  upcomingAppointments: ClinicPatientSummaryPdfAppointment[]
  pastAppointmentSummaries: ClinicPatientSummaryPdfAppointment[]
  visitDates: ClinicPatientSummaryPdfVisitDate[]
}

const PDF_COPY = {
  en: {
    docType: 'PATIENT-SAFE SUMMARY',
    title: 'Patient Summary',
    patientFallback: 'Patient',
    scope:
      'A concise patient handout for identity, medical background, appointments, and visit dates. Internal notes, payments, photos, CRM history, and clinical narratives are excluded.',
    patient: 'PATIENT',
    dob: 'DOB',
    phone: 'PHONE',
    email: 'EMAIL',
    upcoming: 'Upcoming',
    upcomingHint: 'Scheduled future visits',
    pastAppointments: 'Past appts',
    pastAppointmentsHint: 'Last 12 months',
    visitDates: 'Visit dates',
    visitDatesHint: 'Clinical details excluded',
    medicalBackground: 'Medical Background',
    allergies: 'Allergies',
    medications: 'Medications',
    conditions: 'Conditions / Past Medical',
    social: 'Social history',
    careTimeline: 'Care Timeline',
    upcomingAppointments: 'Upcoming appointments',
    pastAppointmentDates: 'Past appointment dates',
    visitDatesExcluded: 'Visit dates - clinical details excluded',
    empty: 'No records in the selected window.',
    footerTitle: 'Patient Summary',
    generated: 'Generated',
    page: 'Page',
    of: 'of',
    footerNotice:
      'Patient-safe copy. Does not include internal notes, payments, photos, CRM history, or clinical visit narrative.',
  },
  ru: {
    docType: 'БЕЗОПАСНАЯ СВОДКА ДЛЯ ПАЦИЕНТА',
    title: 'Сводка пациента',
    patientFallback: 'Пациент',
    scope:
      'Краткая сводка для пациента: личные данные, анамнез, записи и даты визитов. Внутренние заметки, оплаты, фото, CRM-история и клинический текст не включены.',
    patient: 'ПАЦИЕНТ',
    dob: 'ДАТА РОЖДЕНИЯ',
    phone: 'ТЕЛЕФОН',
    email: 'EMAIL',
    upcoming: 'Будущие',
    upcomingHint: 'Запланированные визиты',
    pastAppointments: 'Прошлые записи',
    pastAppointmentsHint: 'За последние 12 месяцев',
    visitDates: 'Даты визитов',
    visitDatesHint: 'Без клинических деталей',
    medicalBackground: 'Медицинский фон',
    allergies: 'Аллергии',
    medications: 'Лекарства',
    conditions: 'Состояния / анамнез',
    social: 'Социальный анамнез',
    careTimeline: 'История ухода',
    upcomingAppointments: 'Будущие записи',
    pastAppointmentDates: 'Прошлые записи',
    visitDatesExcluded: 'Даты визитов - клинические детали скрыты',
    empty: 'За выбранный период записей нет.',
    footerTitle: 'Сводка пациента',
    generated: 'Сформировано',
    page: 'Страница',
    of: 'из',
    footerNotice:
      'Безопасная копия для пациента. Не включает внутренние заметки, оплаты, фото, CRM-историю или клинический текст.',
  },
}

function registerPdfFonts(doc: jsPDF) {
  const regular = readFileSync(join(process.cwd(), 'node_modules/notosans-fontface/fonts/NotoSans-Regular.ttf')).toString('base64')
  const bold = readFileSync(join(process.cwd(), 'node_modules/notosans-fontface/fonts/NotoSans-Bold.ttf')).toString('base64')
  doc.addFileToVFS('NotoSans-Regular.ttf', regular)
  doc.addFileToVFS('NotoSans-Bold.ttf', bold)
  doc.addFont('NotoSans-Regular.ttf', PDF_FONT, 'normal')
  doc.addFont('NotoSans-Bold.ttf', PDF_FONT, 'bold')
  doc.setFont(PDF_FONT, 'normal')
}

function fmtDate(d: Date, locale: 'en' | 'ru'): string {
  return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function fmtDateTime(d: Date, locale: 'en' | 'ru'): string {
  return d.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fileDateStamp(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function pdfSafe(text: string | null | undefined): string {
  const source = (text ?? '').trim()
  if (!source) return '-'
  return source
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
}

function patientFullName(patient: BuildClinicPatientSummaryPdfInput['patient'], fallback: string): string {
  return pdfSafe([patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ') || fallback)
}

function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineMm: number,
  options: { size?: number; color?: [number, number, number]; font?: 'normal' | 'bold' } = {}
): number {
  const body = pdfSafe(text)
  if (options.size) doc.setFontSize(options.size)
  if (options.color) doc.setTextColor(...options.color)
  if (options.font) doc.setFont(PDF_FONT, options.font)
  const lines = doc.splitTextToSize(body, maxW)
  doc.text(lines, x, y)
  return y + Math.max(1, lines.length) * lineMm
}

function needNewPage(y: number, delta: number, pageH: number, bottom: number): boolean {
  return y + delta > pageH - bottom
}

function addPageIfNeeded(doc: jsPDF, y: number, delta: number, top: number, pageH: number, bottom: number): number {
  if (!needNewPage(y, delta, pageH, bottom)) return y
  doc.addPage()
  return top
}

function drawRoundedPanel(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: [number, number, number] = PANEL,
  stroke: [number, number, number] = LINE
) {
  doc.setFillColor(...fill)
  doc.setDrawColor(...stroke)
  doc.roundedRect(x, y, w, h, 3, 3, 'FD')
}

function sectionTitle(doc: jsPDF, title: string, y: number, margin: number, pageH: number, bottom: number): number {
  y = addPageIfNeeded(doc, y, 18, 18, pageH, bottom)
  doc.setDrawColor(...BRAND)
  doc.setLineWidth(0.7)
  doc.line(margin, y - 1.5, margin + 9, y - 1.5)
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...INK)
  doc.text(pdfSafe(title), margin + 12, y)
  return y + 8
}

function keyValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelW: number,
  valueW: number,
  line: number
): number {
  doc.setFontSize(8)
  doc.setFont(PDF_FONT, 'bold')
  doc.setTextColor(...MUTED)
  doc.text(pdfSafe(label).toUpperCase(), x, y)
  doc.setFontSize(10)
  doc.setFont(PDF_FONT, 'normal')
  doc.setTextColor(...INK)
  return paragraph(doc, value, x + labelW, y, valueW, line, { size: 10, color: INK })
}

function renderEmptyState(doc: jsPDF, message: string, x: number, y: number, w: number): number {
  drawRoundedPanel(doc, x, y, w, 15, [255, 255, 255])
  return paragraph(doc, message, x + 4, y + 9, w - 8, 4.8, { size: 9, color: MUTED })
}

function renderTimelineRows(
  doc: jsPDF,
  rows: string[],
  emptyMessage: string,
  y: number,
  margin: number,
  maxW: number,
  pageH: number,
  bottom: number
): number {
  if (rows.length === 0) return renderEmptyState(doc, emptyMessage, margin, y, maxW) + 4

  for (const row of rows) {
    y = addPageIfNeeded(doc, y, 13, 18, pageH, bottom)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.2)
    doc.line(margin + 1.5, y - 3, margin + 1.5, y + 6)
    doc.setFillColor(...BRAND)
    doc.circle(margin + 1.5, y + 1, 1.5, 'F')
    y = paragraph(doc, row, margin + 7, y + 2, maxW - 7, 4.8, { size: 9.5, color: INK })
    y += 2.5
  }
  return y + 2
}

function patientInitials(patient: BuildClinicPatientSummaryPdfInput['patient']) {
  const first = pdfSafe(patient.firstName).charAt(0)
  const last = pdfSafe(patient.lastName).charAt(0)
  return `${first}${last}`.replace(/-/g, '').toUpperCase() || 'P'
}

/**
 * Patient-safe summary: demographics, anamnesis, upcoming slots, past visit dates.
 * Excludes internal notes, CRM, payments, media, and clinical visit narrative.
 */
export function buildClinicPatientSummaryPdf(input: BuildClinicPatientSummaryPdfInput): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  registerPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const maxW = pageW - margin * 2
  const bottom = 24

  const locale = input.locale === 'ru' ? 'ru' : 'en'
  const copy = PDF_COPY[locale]
  const { patient, anamnesis } = input
  const fullName = patientFullName(patient, copy.patientFallback)
  const generatedDate = fileDateStamp(input.generatedAt)
  let y = 14

  // Warm clinical background and strong hero band.
  doc.setFillColor(250, 247, 242)
  doc.rect(0, 0, pageW, pageH, 'F')
  doc.setFillColor(...INK)
  doc.roundedRect(margin, y, maxW, 58, 5, 5, 'F')
  doc.setFillColor(...BRAND)
  doc.roundedRect(pageW - margin - 48, y + 8, 36, 12, 6, 6, 'F')
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  doc.text(generatedDate, pageW - margin - 30, y + 15.5, { align: 'center' })

  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225)
  doc.text(pdfSafe(copy.docType), margin + 8, y + 12)
  doc.setFontSize(19)
  doc.setTextColor(255, 255, 255)
  doc.text(pdfSafe(copy.title), margin + 8, y + 25)
  doc.setFontSize(9)
  doc.setFont(PDF_FONT, 'normal')
  doc.setTextColor(203, 213, 225)
  doc.text(pdfSafe(input.practiceName || 'Practice OS'), margin + 8, y + 35, { maxWidth: 110 })
  paragraph(
    doc,
    copy.scope,
    margin + 8,
    y + 45,
    126,
    4.2,
    { size: 8.5, color: [226, 232, 240] }
  )

  y += 68

  // Patient identity card.
  drawRoundedPanel(doc, margin, y, maxW, 43, [255, 255, 255], [229, 231, 235])
  doc.setFillColor(239, 246, 255)
  doc.circle(margin + 17, y + 21.5, 12, 'F')
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...BRAND_DARK)
  doc.text(patientInitials(patient), margin + 17, y + 25, { align: 'center' })

  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text(pdfSafe(copy.patient), margin + 35, y + 11)
  doc.setFontSize(17)
  doc.setTextColor(...INK)
  doc.text(fullName, margin + 35, y + 21, { maxWidth: maxW - 72 })

  const identityY = y + 32
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...MUTED)
  doc.text(pdfSafe(copy.dob), margin + 35, identityY)
  doc.text(pdfSafe(copy.phone), margin + 76, identityY)
  doc.text(pdfSafe(copy.email), margin + 125, identityY)
  doc.setFont(PDF_FONT, 'normal')
  doc.setFontSize(8.8)
  doc.setTextColor(...INK)
  doc.text(pdfSafe(patient.dateOfBirth ? fmtDate(patient.dateOfBirth, locale) : '-'), margin + 35, identityY + 5)
  doc.text(pdfSafe(patient.phone?.trim() || '-'), margin + 76, identityY + 5, { maxWidth: 42 })
  doc.text(pdfSafe(patient.email?.trim() || '-'), margin + 125, identityY + 5, { maxWidth: 52 })

  y += 53

  // At-a-glance operational cards.
  const metricGap = 4
  const metricW = (maxW - metricGap * 2) / 3
  const metricY = y
  const metrics: [string, number, string, [number, number, number]][] = [
    [copy.upcoming, input.upcomingAppointments.length, copy.upcomingHint, BRAND],
    [copy.pastAppointments, input.pastAppointmentSummaries.length, copy.pastAppointmentsHint, [15, 118, 110]],
    [copy.visitDates, input.visitDates.length, copy.visitDatesHint, WARNING],
  ]
  metrics.forEach(([label, count, subtitle, color], index) => {
    const x = margin + index * (metricW + metricGap)
    drawRoundedPanel(doc, x, metricY, metricW, 27, [255, 255, 255], [229, 231, 235])
    doc.setFillColor(...color)
    doc.roundedRect(x + 5, metricY + 5, 6, 17, 3, 3, 'F')
    doc.setFont(PDF_FONT, 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...INK)
    doc.text(String(count), x + 15, metricY + 12)
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), x + 15, metricY + 18)
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(7.2)
    doc.text(pdfSafe(subtitle), x + 15, metricY + 23, { maxWidth: metricW - 20 })
  })
  y += 39

  // Medical background cards.
  y = sectionTitle(doc, copy.medicalBackground, y, margin, pageH, bottom)
  const blocks: [string, string][] = [
    [copy.allergies, anamnesis.allergies],
    [copy.medications, anamnesis.medications],
    [copy.conditions, anamnesis.conditions],
    [copy.social, anamnesis.social],
  ]
  const cardGap = 5
  const cardW = (maxW - cardGap) / 2
  for (let i = 0; i < blocks.length; i += 2) {
    const row = blocks.slice(i, i + 2)
    const heights = row.map(([, body]) => {
      const bodyLines = doc.splitTextToSize(pdfSafe(body), cardW - 10)
      return Math.max(26, 15 + bodyLines.length * 4.7)
    })
    const rowH = Math.max(...heights)
    y = addPageIfNeeded(doc, y, rowH + 5, 18, pageH, bottom)
    row.forEach(([title, body], rowIndex) => {
      const x = margin + rowIndex * (cardW + cardGap)
      drawRoundedPanel(doc, x, y, cardW, rowH, [255, 255, 255], [229, 231, 235])
      doc.setFont(PDF_FONT, 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...MUTED)
      doc.text(pdfSafe(title).toUpperCase(), x + 5, y + 8)
      paragraph(doc, body, x + 5, y + 16, cardW - 10, 4.7, { size: 9.5, color: INK })
    })
    y += rowH + 5
  }

  y += 4
  y = sectionTitle(doc, copy.careTimeline, y, margin, pageH, bottom)

  const timelineSections: [string, string[], [number, number, number]][] = [
    [copy.upcomingAppointments, input.upcomingAppointments.map((a) => `${fmtDateTime(a.startsAt, locale)} - ${a.label}`), BRAND],
    [copy.pastAppointmentDates, input.pastAppointmentSummaries.map((a) => `${fmtDateTime(a.startsAt, locale)} - ${a.label}`), [15, 118, 110]],
    [copy.visitDatesExcluded, input.visitDates.map((v) => fmtDateTime(v.visitAt, locale)), WARNING],
  ]

  for (const [title, rows, accent] of timelineSections) {
    y = addPageIfNeeded(doc, y, 24, 18, pageH, bottom)
    drawRoundedPanel(doc, margin, y, maxW, 12, [255, 255, 255], [229, 231, 235])
    doc.setFillColor(...accent)
    doc.roundedRect(margin + 4, y + 3, 6, 6, 2, 2, 'F')
    doc.setFont(PDF_FONT, 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...INK)
    doc.text(pdfSafe(title), margin + 14, y + 7.8)
    y += 18
    y = renderTimelineRows(doc, rows, copy.empty, y, margin, maxW, pageH, bottom)
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.2)
    doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    const foot = `${copy.footerTitle} - ${copy.generated} ${fmtDateTime(input.generatedAt, locale)} - ${copy.page} ${i} ${copy.of} ${pageCount}`
    doc.text(pdfSafe(foot), margin, pageH - 12, { maxWidth: maxW })
    doc.text(
      pdfSafe(copy.footerNotice),
      margin,
      pageH - 7,
      { maxWidth: maxW }
    )
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
