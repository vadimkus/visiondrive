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

/**
 * Patient-safe summary: demographics, anamnesis, upcoming slots, past visit dates.
 * Excludes internal notes, CRM, payments, media, and clinical visit narrative.
 */
export function buildClinicPatientSummaryPdf(input: BuildClinicPatientSummaryPdfInput): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 16
  const maxW = pageW - margin * 2
  const line = 5
  const bottom = 24

  const { patient, anamnesis } = input
  const fullName = patientFullName(patient)
  let y = 18

  doc.setFillColor(...BRAND)
  doc.rect(0, 0, pageW, 34, 'F')
  doc.setFillColor(...BRAND_DARK)
  doc.rect(0, 0, 5, pageH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(219, 234, 254)
  doc.text(pdfSafe(input.practiceName || 'Practice'), margin, y)
  doc.setFontSize(7.5)
  doc.setTextColor(191, 219, 254)
  doc.text('PATIENT-SAFE HANDOUT', pageW - margin, y, { align: 'right' })

  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('Patient Summary', margin, 28)

  y = 44
  drawRoundedPanel(doc, margin, y, maxW, 40, [255, 255, 255])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.text('PATIENT', margin + 5, y + 8)
  doc.setFontSize(16)
  doc.setTextColor(...INK)
  doc.text(fullName, margin + 5, y + 17, { maxWidth: maxW - 10 })

  const leftX = margin + 5
  const rightX = margin + maxW / 2 + 2
  let infoY = y + 28
  infoY = keyValue(doc, 'Date of birth', patient.dateOfBirth ? fmtDate(patient.dateOfBirth) : '-', leftX, infoY, 29, maxW / 2 - 36, line)
  keyValue(doc, 'Generated', fmtDateTime(input.generatedAt), rightX, y + 28, 24, maxW / 2 - 31, line)
  infoY = Math.max(
    keyValue(doc, 'Phone', patient.phone?.trim() || '-', leftX, infoY + 1, 29, maxW / 2 - 36, line),
    keyValue(doc, 'Email', patient.email?.trim() || '-', rightX, y + 34, 24, maxW / 2 - 31, line)
  )

  y += 50

  drawRoundedPanel(doc, margin, y, maxW, 22, [239, 246, 255], [191, 219, 254])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_DARK)
  doc.text('Scope of this patient-safe summary', margin + 5, y + 7)
  paragraph(
    doc,
    'Includes patient identity, anamnesis, upcoming appointments, recent appointment dates, and visit dates. Excludes internal notes, payments, photos, CRM history, and clinical visit narrative.',
    margin + 5,
    y + 13,
    maxW - 10,
    4.2,
    { size: 8.5, color: BRAND_DARK }
  )
  y += 32

  y = sectionTitle(doc, 'Medical Background', y, margin, pageH, bottom)

  const blocks: [string, string][] = [
    ['Allergies', anamnesis.allergies],
    ['Medications', anamnesis.medications],
    ['Conditions / Past Medical', anamnesis.conditions],
    ['Social history', anamnesis.social],
  ]
  for (const [title, body] of blocks) {
    const bodyLines = doc.splitTextToSize(pdfSafe(body), maxW - 12)
    const blockH = Math.max(22, 13 + bodyLines.length * 4.7)
    y = addPageIfNeeded(doc, y, blockH + 4, 18, pageH, bottom)
    drawRoundedPanel(doc, margin, y, maxW, blockH, [255, 255, 255])
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(pdfSafe(title).toUpperCase(), margin + 5, y + 7)
    paragraph(doc, body, margin + 5, y + 14, maxW - 10, 4.7, { size: 10, color: INK })
    y += blockH + 5
  }

  y += 2
  y = sectionTitle(doc, 'Care Timeline', y, margin, pageH, bottom)

  const metricW = (maxW - 8) / 3
  drawRoundedPanel(doc, margin, y, metricW, 22, [255, 255, 255])
  drawRoundedPanel(doc, margin + metricW + 4, y, metricW, 22, [255, 255, 255])
  drawRoundedPanel(doc, margin + (metricW + 4) * 2, y, metricW, 22, [255, 255, 255])
  const metrics: [string, number, number][] = [
    ['Upcoming', input.upcomingAppointments.length, margin],
    ['Past appts', input.pastAppointmentSummaries.length, margin + metricW + 4],
    ['Visit dates', input.visitDates.length, margin + (metricW + 4) * 2],
  ]
  for (const [label, count, x] of metrics) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...INK)
    doc.text(String(count), x + 5, y + 10)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), x + 5, y + 17)
  }
  y += 31

  y = addPageIfNeeded(doc, y, 22, 18, pageH, bottom)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('Upcoming appointments', margin, y)
  y += 6
  y = renderTimelineRows(
    doc,
    input.upcomingAppointments.map((a) => `${fmtDateTime(a.startsAt)} - ${a.label}`),
    y,
    margin,
    maxW,
    pageH,
    bottom
  )

  y = addPageIfNeeded(doc, y, 22, 18, pageH, bottom)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('Past appointment dates', margin, y)
  y += 6
  y = renderTimelineRows(
    doc,
    input.pastAppointmentSummaries.map((a) => `${fmtDateTime(a.startsAt)} - ${a.label}`),
    y,
    margin,
    maxW,
    pageH,
    bottom
  )

  y = addPageIfNeeded(doc, y, 22, 18, pageH, bottom)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('Visit dates - clinical details excluded', margin, y)
  y += 6
  y = renderTimelineRows(
    doc,
    input.visitDates.map((v) => fmtDateTime(v.visitAt)),
    y,
    margin,
    maxW,
    pageH,
    bottom
  )

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
