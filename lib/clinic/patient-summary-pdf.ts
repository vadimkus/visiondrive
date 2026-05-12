import jsPDF from 'jspdf'
import type { ClinicAnamnesisV1 } from '@/lib/clinic/anamnesis'

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

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'A',
  а: 'a',
  Б: 'B',
  б: 'b',
  В: 'V',
  в: 'v',
  Г: 'G',
  г: 'g',
  Д: 'D',
  д: 'd',
  Е: 'E',
  е: 'e',
  Ё: 'E',
  ё: 'e',
  Ж: 'Zh',
  ж: 'zh',
  З: 'Z',
  з: 'z',
  И: 'I',
  и: 'i',
  Й: 'Y',
  й: 'y',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  О: 'O',
  о: 'o',
  П: 'P',
  п: 'p',
  Р: 'R',
  р: 'r',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  У: 'U',
  у: 'u',
  Ф: 'F',
  ф: 'f',
  Х: 'Kh',
  х: 'kh',
  Ц: 'Ts',
  ц: 'ts',
  Ч: 'Ch',
  ч: 'ch',
  Ш: 'Sh',
  ш: 'sh',
  Щ: 'Shch',
  щ: 'shch',
  Ъ: '',
  ъ: '',
  Ы: 'Y',
  ы: 'y',
  Ь: '',
  ь: '',
  Э: 'E',
  э: 'e',
  Ю: 'Yu',
  ю: 'yu',
  Я: 'Ya',
  я: 'ya',
  І: 'I',
  і: 'i',
  Ї: 'Yi',
  ї: 'yi',
  Є: 'Ye',
  є: 'ye',
  Ґ: 'G',
  ґ: 'g',
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function fmtDateTime(d: Date): string {
  return d.toLocaleString('en-AE', {
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
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '?')
}

function patientFullName(patient: BuildClinicPatientSummaryPdfInput['patient']): string {
  return pdfSafe([patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ') || 'Patient')
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
  if (options.font) doc.setFont('helvetica', options.font)
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
  doc.setFont('helvetica', 'bold')
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
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.text(pdfSafe(label).toUpperCase(), x, y)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
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
  y: number,
  margin: number,
  maxW: number,
  pageH: number,
  bottom: number
): number {
  if (rows.length === 0) return renderEmptyState(doc, 'No records in the selected window.', margin, y, maxW) + 4

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
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const maxW = pageW - margin * 2
  const bottom = 24

  const { patient, anamnesis } = input
  const fullName = patientFullName(patient)
  const generatedDate = fileDateStamp(input.generatedAt)
  let y = 14

  // Warm clinical background and strong hero band.
  doc.setFillColor(250, 247, 242)
  doc.rect(0, 0, pageW, pageH, 'F')
  doc.setFillColor(...INK)
  doc.roundedRect(margin, y, maxW, 58, 5, 5, 'F')
  doc.setFillColor(...BRAND)
  doc.roundedRect(pageW - margin - 48, y + 8, 36, 12, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  doc.text(generatedDate, pageW - margin - 30, y + 15.5, { align: 'center' })

  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225)
  doc.text('PATIENT-SAFE SUMMARY', margin + 8, y + 12)
  doc.setFontSize(19)
  doc.setTextColor(255, 255, 255)
  doc.text('Patient Summary', margin + 8, y + 25)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(203, 213, 225)
  doc.text(pdfSafe(input.practiceName || 'Practice'), margin + 8, y + 35, { maxWidth: 110 })
  paragraph(
    doc,
    'A concise patient handout for identity, medical background, appointments, and visit dates. Internal notes, payments, photos, CRM history, and clinical narratives are excluded.',
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
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...BRAND_DARK)
  doc.text(patientInitials(patient), margin + 17, y + 25, { align: 'center' })

  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text('PATIENT', margin + 35, y + 11)
  doc.setFontSize(17)
  doc.setTextColor(...INK)
  doc.text(fullName, margin + 35, y + 21, { maxWidth: maxW - 72 })

  const identityY = y + 32
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...MUTED)
  doc.text('DOB', margin + 35, identityY)
  doc.text('PHONE', margin + 76, identityY)
  doc.text('EMAIL', margin + 125, identityY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.8)
  doc.setTextColor(...INK)
  doc.text(pdfSafe(patient.dateOfBirth ? fmtDate(patient.dateOfBirth) : '-'), margin + 35, identityY + 5)
  doc.text(pdfSafe(patient.phone?.trim() || '-'), margin + 76, identityY + 5, { maxWidth: 42 })
  doc.text(pdfSafe(patient.email?.trim() || '-'), margin + 125, identityY + 5, { maxWidth: 52 })

  y += 53

  // At-a-glance operational cards.
  const metricGap = 4
  const metricW = (maxW - metricGap * 2) / 3
  const metricY = y
  const metrics: [string, number, string, [number, number, number]][] = [
    ['Upcoming', input.upcomingAppointments.length, 'Scheduled future visits', BRAND],
    ['Past appts', input.pastAppointmentSummaries.length, 'Last 12 months', [15, 118, 110]],
    ['Visit dates', input.visitDates.length, 'Clinical details excluded', WARNING],
  ]
  metrics.forEach(([label, count, subtitle, color], index) => {
    const x = margin + index * (metricW + metricGap)
    drawRoundedPanel(doc, x, metricY, metricW, 27, [255, 255, 255], [229, 231, 235])
    doc.setFillColor(...color)
    doc.roundedRect(x + 5, metricY + 5, 6, 17, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...INK)
    doc.text(String(count), x + 15, metricY + 12)
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), x + 15, metricY + 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.text(pdfSafe(subtitle), x + 15, metricY + 23, { maxWidth: metricW - 20 })
  })
  y += 39

  // Medical background cards.
  y = sectionTitle(doc, 'Medical Background', y, margin, pageH, bottom)
  const blocks: [string, string][] = [
    ['Allergies', anamnesis.allergies],
    ['Medications', anamnesis.medications],
    ['Conditions / Past Medical', anamnesis.conditions],
    ['Social history', anamnesis.social],
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
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...MUTED)
      doc.text(pdfSafe(title).toUpperCase(), x + 5, y + 8)
      paragraph(doc, body, x + 5, y + 16, cardW - 10, 4.7, { size: 9.5, color: INK })
    })
    y += rowH + 5
  }

  y += 4
  y = sectionTitle(doc, 'Care Timeline', y, margin, pageH, bottom)

  const timelineSections: [string, string[], [number, number, number]][] = [
    ['Upcoming appointments', input.upcomingAppointments.map((a) => `${fmtDateTime(a.startsAt)} - ${a.label}`), BRAND],
    ['Past appointment dates', input.pastAppointmentSummaries.map((a) => `${fmtDateTime(a.startsAt)} - ${a.label}`), [15, 118, 110]],
    ['Visit dates - clinical details excluded', input.visitDates.map((v) => fmtDateTime(v.visitAt)), WARNING],
  ]

  for (const [title, rows, accent] of timelineSections) {
    y = addPageIfNeeded(doc, y, 24, 18, pageH, bottom)
    drawRoundedPanel(doc, margin, y, maxW, 12, [255, 255, 255], [229, 231, 235])
    doc.setFillColor(...accent)
    doc.roundedRect(margin + 4, y + 3, 6, 6, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...INK)
    doc.text(pdfSafe(title), margin + 14, y + 7.8)
    y += 18
    y = renderTimelineRows(doc, rows, y, margin, maxW, pageH, bottom)
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.2)
    doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    const foot = `Patient Summary - Generated ${fmtDateTime(input.generatedAt)} - Page ${i} of ${pageCount}`
    doc.text(pdfSafe(foot), margin, pageH - 12, { maxWidth: maxW })
    doc.text(
      'Patient-safe copy. Does not include internal notes, payments, photos, CRM history, or clinical visit narrative.',
      margin,
      pageH - 7,
      { maxWidth: maxW }
    )
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
