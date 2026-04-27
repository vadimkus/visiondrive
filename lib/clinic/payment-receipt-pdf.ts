import jsPDF from 'jspdf'

const ACCENT: [number, number, number] = [255, 149, 0]

export type BuildClinicPaymentReceiptPdfInput = {
  practiceName: string
  generatedAt: Date
  receiptNo: string
  patient: {
    firstName: string
    lastName: string
    middleName: string | null
    phone: string | null
    email: string | null
  }
  payment: {
    amountCents: number
    discountCents: number
    feeCents: number
    currency: string
    method: string
    status: string
    reference: string | null
    note: string | null
    paidAt: Date
  }
  appointment?: {
    startsAt: Date
    label: string
    basePriceCents: number
  } | null
}

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
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

export function buildClinicPaymentReceiptPdf(input: BuildClinicPaymentReceiptPdfInput): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 16
  const maxW = pageW - margin * 2
  const line = 6
  let y = 14
  const currency = input.payment.currency || 'AED'

  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, pageW, 4, 'F')

  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(input.practiceName || 'Practice', margin, y)
  y += 8

  doc.setFontSize(20)
  doc.setTextColor(20, 20, 20)
  doc.text('Payment receipt', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setTextColor(70, 70, 70)
  doc.text(`Receipt: ${input.receiptNo}`, margin, y)
  y += line
  doc.text(`Generated: ${fmtDateTime(input.generatedAt)}`, margin, y)
  y += line + 4

  const fullName = [input.patient.firstName, input.patient.middleName, input.patient.lastName]
    .filter(Boolean)
    .join(' ')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Patient', margin, y)
  y += line
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  doc.text(fullName || 'Patient', margin, y)
  y += line
  doc.text(`Phone: ${input.patient.phone?.trim() || '-'}`, margin, y)
  y += line
  doc.text(`Email: ${input.patient.email?.trim() || '-'}`, margin, y)
  y += line + 4

  if (input.appointment) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Service', margin, y)
    y += line
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    const serviceLines = doc.splitTextToSize(input.appointment.label, maxW)
    doc.text(serviceLines, margin, y)
    y += serviceLines.length * line
    doc.text(`Appointment: ${fmtDateTime(input.appointment.startsAt)}`, margin, y)
    y += line + 4
  }

  const servicePrice = input.appointment?.basePriceCents ?? input.payment.amountCents
  const totalDue = Math.max(
    servicePrice - input.payment.discountCents + input.payment.feeCents,
    0
  )

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Payment', margin, y)
  y += line + 2
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)

  const rows: [string, string][] = [
    ['Service price', money(servicePrice, currency)],
    ['Discount', `-${money(input.payment.discountCents, currency)}`],
    ['Fee', money(input.payment.feeCents, currency)],
    ['Total due', money(totalDue, currency)],
    ['Paid', money(input.payment.amountCents, currency)],
    ['Method', input.payment.method],
    ['Status', input.payment.status],
    ['Paid at', fmtDateTime(input.payment.paidAt)],
  ]

  if (input.payment.reference) rows.push(['Reference', input.payment.reference])
  if (input.payment.note) rows.push(['Note', input.payment.note])

  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), margin + 52, y, { maxWidth: maxW - 52 })
    y += line
  }

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(
    'This receipt confirms the payment recorded in VisionDrive Practice OS.',
    margin,
    286,
    { maxWidth: maxW }
  )

  return doc.output('arraybuffer') as ArrayBuffer
}
