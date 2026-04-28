import jsPDF from 'jspdf'
import type { ClinicAnamnesisV1 } from '@/lib/clinic/anamnesis'

const ACCENT: [number, number, number] = [255, 149, 0]

export type PatientSafeExportVisit = {
  visitAt: Date
  label: string
  procedureSummary: string | null
  nextSteps: string | null
  aftercareTitle: string | null
  aftercareText: string | null
  aftercareDocumentName: string | null
  aftercareDocumentUrl: string | null
}

export type PatientSafeExportPayment = {
  paidAt: Date
  label: string
  amountCents: number
  currency: string
  method: string
  status: string
  reference: string | null
}

export type PatientSafeExportConsent = {
  title: string
  body: string
  procedureName: string | null
  contraindications: string[]
  checkedItems: string[]
  patientName: string
  signatureText: string | null
  acceptedAt: Date | null
  aftercareAcknowledged: boolean
}

export type BuildPatientSafeExportPdfInput = {
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
  visits: PatientSafeExportVisit[]
  payments: PatientSafeExportPayment[]
  consents: PatientSafeExportConsent[]
}

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })
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
  const body = text.trim() || '-'
  const lines = doc.splitTextToSize(body, maxW)
  doc.text(lines, x, y)
  return y + Math.max(1, lines.length) * lineMm
}

function needNewPage(y: number, delta: number, pageH: number, bottom: number): boolean {
  return y + delta > pageH - bottom
}

function section(doc: jsPDF, title: string, y: number, margin: number, pageH: number, bottom: number) {
  if (needNewPage(y, 16, pageH, bottom)) {
    doc.addPage()
    y = margin
  }
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(title, margin, y)
  return y + 7
}

function renderKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
  line: number
) {
  doc.setFont('helvetica', 'bold')
  doc.text(label, x, y)
  doc.setFont('helvetica', 'normal')
  return paragraph(doc, value, x + 42, y, maxW - 42, line)
}

/**
 * Patient-safe clinical export.
 *
 * Includes patient-facing treatment summaries, aftercare, accepted consent snapshots,
 * and receipt summaries. Excludes internal notes, staff notes, CRM, photo binaries,
 * deletion/audit metadata, and private appointment notes by construction.
 */
export function buildPatientSafeExportPdf(input: BuildPatientSafeExportPdfInput): ArrayBuffer {
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
  y += 7

  doc.setFontSize(18)
  doc.setTextColor(20, 20, 20)
  doc.text('Patient-safe treatment export', margin, y)
  y += 9

  const fullName = [input.patient.firstName, input.patient.middleName, input.patient.lastName]
    .filter(Boolean)
    .join(' ')
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  y = paragraph(doc, `Patient: ${fullName || 'Patient'}`, margin, y, maxW, line)
  y = paragraph(doc, `DOB: ${fmtDate(input.patient.dateOfBirth)}`, margin, y, maxW, line)
  y = paragraph(doc, `Phone: ${input.patient.phone?.trim() || '-'}`, margin, y, maxW, line)
  y = paragraph(doc, `Email: ${input.patient.email?.trim() || '-'}`, margin, y, maxW, line)
  y += 3

  y = section(doc, 'Medical history', y, margin, pageH, bottom)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(45, 45, 45)
  const history: [string, string][] = [
    ['Allergies', input.anamnesis.allergies],
    ['Medications', input.anamnesis.medications],
    ['Conditions', input.anamnesis.conditions],
    ['Social', input.anamnesis.social],
  ]
  for (const [label, value] of history) {
    if (needNewPage(y, 18, pageH, bottom)) {
      doc.addPage()
      y = margin
    }
    y = renderKeyValue(doc, label, value || '-', margin, y, maxW, line)
    y += 1
  }
  y += 3

  y = section(doc, 'Treatment summaries and aftercare', y, margin, pageH, bottom)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (input.visits.length === 0) {
    y = paragraph(doc, 'No completed treatment summaries on file.', margin, y, maxW, line)
  } else {
    for (const visit of input.visits) {
      if (needNewPage(y, 44, pageH, bottom)) {
        doc.addPage()
        y = margin
      }
      doc.setFont('helvetica', 'bold')
      y = paragraph(doc, `${fmtDateTime(visit.visitAt)} - ${visit.label}`, margin, y, maxW, line)
      doc.setFont('helvetica', 'normal')
      if (visit.procedureSummary) {
        y = renderKeyValue(doc, 'Summary', visit.procedureSummary, margin, y, maxW, line)
      }
      const aftercareText = visit.aftercareText || visit.nextSteps
      if (visit.aftercareTitle || aftercareText) {
        y = renderKeyValue(doc, 'Aftercare', [visit.aftercareTitle, aftercareText].filter(Boolean).join('\n'), margin, y, maxW, line)
      }
      if (visit.aftercareDocumentUrl) {
        y = renderKeyValue(
          doc,
          'Document',
          `${visit.aftercareDocumentName || 'Aftercare document'}: ${visit.aftercareDocumentUrl}`,
          margin,
          y,
          maxW,
          line
        )
      }
      y += 3
    }
  }
  y += 2

  y = section(doc, 'Receipts', y, margin, pageH, bottom)
  doc.setFontSize(10)
  if (input.payments.length === 0) {
    y = paragraph(doc, 'No patient-safe receipt rows on file.', margin, y, maxW, line)
  } else {
    for (const payment of input.payments) {
      if (needNewPage(y, 24, pageH, bottom)) {
        doc.addPage()
        y = margin
      }
      const lineText = `${fmtDateTime(payment.paidAt)} - ${payment.label} - ${money(payment.amountCents, payment.currency)} - ${payment.method} - ${payment.status}`
      y = paragraph(doc, lineText, margin, y, maxW, line)
      if (payment.reference) {
        y = paragraph(doc, `Reference: ${payment.reference}`, margin + 5, y, maxW - 5, line)
      }
    }
  }
  y += 3

  y = section(doc, 'Accepted consents', y, margin, pageH, bottom)
  doc.setFontSize(10)
  if (input.consents.length === 0) {
    y = paragraph(doc, 'No accepted consent snapshots on file.', margin, y, maxW, line)
  } else {
    for (const consent of input.consents) {
      if (needNewPage(y, 48, pageH, bottom)) {
        doc.addPage()
        y = margin
      }
      doc.setFont('helvetica', 'bold')
      y = paragraph(doc, consent.title, margin, y, maxW, line)
      doc.setFont('helvetica', 'normal')
      y = paragraph(
        doc,
        [
          consent.procedureName ? `Procedure: ${consent.procedureName}` : '',
          consent.acceptedAt ? `Accepted: ${fmtDateTime(consent.acceptedAt)}` : '',
          `Patient name: ${consent.patientName}`,
          consent.signatureText ? `Signature: ${consent.signatureText}` : '',
          `Aftercare acknowledged: ${consent.aftercareAcknowledged ? 'yes' : 'no'}`,
        ].filter(Boolean).join('\n'),
        margin,
        y,
        maxW,
        line
      )
      if (consent.contraindications.length || consent.checkedItems.length) {
        y = paragraph(
          doc,
          `Reviewed items: ${[...consent.checkedItems, ...consent.contraindications].join(', ')}`,
          margin,
          y,
          maxW,
          line
        )
      }
      y = paragraph(doc, consent.body, margin, y, maxW, line)
      y += 3
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `Patient-safe export · Generated ${fmtDateTime(input.generatedAt)} · Page ${i} of ${pageCount}`,
      margin,
      pageH - 10,
      { maxWidth: maxW }
    )
    doc.text(
      'Excludes internal notes, staff notes, CRM history, private appointment notes, and photos.',
      margin,
      pageH - 6,
      { maxWidth: maxW }
    )
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
