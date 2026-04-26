import jsPDF from 'jspdf'
import type { ClinicAnamnesisV1 } from '@/lib/clinic/anamnesis'

const ACCENT: [number, number, number] = [255, 149, 0]

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
    dateOfBirth: Date
    phone: string | null
    email: string | null
  }
  anamnesis: ClinicAnamnesisV1
  upcomingAppointments: ClinicPatientSummaryPdfAppointment[]
  pastAppointmentSummaries: ClinicPatientSummaryPdfAppointment[]
  visitDates: ClinicPatientSummaryPdfVisitDate[]
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

function paragraph(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineMm: number): number {
  const body = text.trim() || '—'
  const lines = doc.splitTextToSize(body, maxW)
  doc.text(lines, x, y)
  return y + Math.max(1, lines.length) * lineMm
}

function needNewPage(y: number, delta: number, pageH: number, bottom: number): boolean {
  return y + delta > pageH - bottom
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
  const line = 5.2
  const bottom = 18

  let y = margin

  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, pageW, 4, 'F')
  y = 14

  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(input.practiceName || 'Practice', margin, y)
  y += 6

  doc.setFontSize(18)
  doc.setTextColor(20, 20, 20)
  doc.text('Patient summary', margin, y)
  y += 10

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  const { patient, anamnesis } = input
  const fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(fullName, margin, y)
  y += line

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  y = paragraph(doc, `Date of birth: ${fmtDate(patient.dateOfBirth)}`, margin, y, maxW, line)
  y = paragraph(doc, `Phone: ${patient.phone?.trim() || '—'}`, margin, y, maxW, line)
  y = paragraph(doc, `Email: ${patient.email?.trim() || '—'}`, margin, y, maxW, line)
  y += 4

  if (needNewPage(y, 40, pageH, bottom)) {
    doc.addPage()
    y = margin
  }

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Medical history (anamnesis)', margin, y)
  y += line + 1
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(45, 45, 45)

  const blocks: [string, string][] = [
    ['Allergies', anamnesis.allergies],
    ['Medications', anamnesis.medications],
    ['Conditions / past medical', anamnesis.conditions],
    ['Social history', anamnesis.social],
  ]
  for (const [title, body] of blocks) {
    if (needNewPage(y, 24, pageH, bottom)) {
      doc.addPage()
      y = margin
    }
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    y += line - 0.5
    doc.setFont('helvetica', 'normal')
    y = paragraph(doc, body, margin, y, maxW, line)
    y += 2
  }

  y += 2
  if (needNewPage(y, 30, pageH, bottom)) {
    doc.addPage()
    y = margin
  }

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Upcoming appointments', margin, y)
  y += line + 1
  doc.setFont('helvetica', 'normal')
  if (input.upcomingAppointments.length === 0) {
    y = paragraph(doc, 'None scheduled.', margin, y, maxW, line)
  } else {
    for (const a of input.upcomingAppointments) {
      if (needNewPage(y, line * 2, pageH, bottom)) {
        doc.addPage()
        y = margin
      }
      y = paragraph(doc, `• ${fmtDateTime(a.startsAt)} — ${a.label}`, margin, y, maxW, line)
    }
  }
  y += 4

  if (needNewPage(y, 28, pageH, bottom)) {
    doc.addPage()
    y = margin
  }
  doc.setFont('helvetica', 'bold')
  doc.text('Past appointment dates', margin, y)
  y += line + 1
  doc.setFont('helvetica', 'normal')
  if (input.pastAppointmentSummaries.length === 0) {
    y = paragraph(doc, 'None on file in the selected window.', margin, y, maxW, line)
  } else {
    for (const a of input.pastAppointmentSummaries) {
      if (needNewPage(y, line * 2, pageH, bottom)) {
        doc.addPage()
        y = margin
      }
      y = paragraph(doc, `• ${fmtDateTime(a.startsAt)} — ${a.label}`, margin, y, maxW, line)
    }
  }
  y += 4

  if (needNewPage(y, 28, pageH, bottom)) {
    doc.addPage()
    y = margin
  }
  doc.setFont('helvetica', 'bold')
  doc.text('Visit dates (no clinical details)', margin, y)
  y += line + 1
  doc.setFont('helvetica', 'normal')
  if (input.visitDates.length === 0) {
    y = paragraph(doc, 'None on file in the selected window.', margin, y, maxW, line)
  } else {
    for (const v of input.visitDates) {
      if (needNewPage(y, line * 2, pageH, bottom)) {
        doc.addPage()
        y = margin
      }
      y = paragraph(doc, `• ${fmtDateTime(v.visitAt)}`, margin, y, maxW, line)
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    const foot = `Patient summary · Generated ${fmtDateTime(input.generatedAt)} · Page ${i} of ${pageCount}`
    doc.text(foot, margin, pageH - 10, { maxWidth: maxW })
    doc.text(
      'Does not include internal practice notes, payments, photos, or clinical visit notes.',
      margin,
      pageH - 6,
      { maxWidth: maxW }
    )
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
