import jsPDF from 'jspdf'
import { money, quoteValidUntilLabel } from '@/lib/clinic/price-quotes'

const ACCENT: [number, number, number] = [255, 149, 0]

export type BuildPriceQuotePdfInput = {
  practiceName: string
  generatedAt: Date
  patient: {
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
  }
  quote: {
    quoteNumber: string
    title: string
    currency: string
    subtotalCents: number
    discountCents: number
    totalCents: number
    validUntil: Date | null
    note: string | null
    terms: string | null
    lines: Array<{
      description: string
      quantity: number
      unitPriceCents: number
      totalCents: number
    }>
  }
}

function paragraph(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineMm: number): number {
  const lines = doc.splitTextToSize(text.trim() || '-', maxW)
  doc.text(lines, x, y)
  return y + Math.max(1, lines.length) * lineMm
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function buildPriceQuotePdf(input: BuildPriceQuotePdfInput): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 16
  const maxW = pageW - margin * 2
  const line = 5.2
  const patientName = [input.patient.firstName, input.patient.lastName].filter(Boolean).join(' ')
  const validUntil = quoteValidUntilLabel(input.quote.validUntil)
  let y = margin

  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, pageW, 5, 'F')

  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text(input.practiceName || 'Practice', margin, y)
  doc.text(`Generated ${fmtDate(input.generatedAt)}`, pageW - margin, y, { align: 'right' })
  y += 10

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 20, 20)
  doc.text('Treatment Estimate', margin, y)
  y += 9

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(70, 70, 70)
  y = paragraph(doc, `${input.quote.title} · ${input.quote.quoteNumber}`, margin, y, maxW, line)
  y += 4

  doc.setFillColor(255, 247, 237)
  doc.roundedRect(margin, y, maxW, 30, 4, 4, 'F')
  doc.setFontSize(10)
  doc.setTextColor(55, 55, 55)
  doc.text(`Prepared for: ${patientName || 'Patient'}`, margin + 5, y + 8)
  doc.text(`Phone: ${input.patient.phone?.trim() || '-'}`, margin + 5, y + 15)
  doc.text(`Email: ${input.patient.email?.trim() || '-'}`, margin + 5, y + 22)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(20, 20, 20)
  doc.text(money(input.quote.totalCents, input.quote.currency), pageW - margin - 5, y + 14, {
    align: 'right',
  })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(110, 110, 110)
  doc.text(validUntil ? `Valid until ${validUntil}` : 'Estimate', pageW - margin - 5, y + 21, {
    align: 'right',
  })
  y += 40

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 20, 20)
  doc.text('Recommended services', margin, y)
  y += 8

  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text('Service', margin, y)
  doc.text('Qty', pageW - 68, y, { align: 'right' })
  doc.text('Unit', pageW - 43, y, { align: 'right' })
  doc.text('Total', pageW - margin, y, { align: 'right' })
  y += 2
  doc.setDrawColor(230, 230, 230)
  doc.line(margin, y, pageW - margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  for (const item of input.quote.lines) {
    doc.setFont('helvetica', 'normal')
    const descriptionLines = doc.splitTextToSize(item.description, 86)
    doc.text(descriptionLines, margin, y)
    doc.text(String(item.quantity), pageW - 68, y, { align: 'right' })
    doc.text(money(item.unitPriceCents, input.quote.currency), pageW - 43, y, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(money(item.totalCents, input.quote.currency), pageW - margin, y, { align: 'right' })
    y += Math.max(1, descriptionLines.length) * line + 4
  }

  y += 3
  doc.setDrawColor(230, 230, 230)
  doc.line(pageW - 82, y, pageW - margin, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal', pageW - 55, y)
  doc.text(money(input.quote.subtotalCents, input.quote.currency), pageW - margin, y, { align: 'right' })
  y += 6
  if (input.quote.discountCents > 0) {
    doc.text('Discount', pageW - 55, y)
    doc.text(`-${money(input.quote.discountCents, input.quote.currency)}`, pageW - margin, y, { align: 'right' })
    y += 6
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Estimated total', pageW - 55, y)
  doc.text(money(input.quote.totalCents, input.quote.currency), pageW - margin, y, { align: 'right' })
  y += 13

  doc.setFontSize(12)
  doc.setTextColor(20, 20, 20)
  doc.text('Next step', margin, y)
  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 55, 55)
  y = paragraph(
    doc,
    input.quote.note ||
      'Reply to your practitioner to confirm timing, ask questions, or adjust the plan before booking.',
    margin,
    y,
    maxW,
    line
  )
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.text('Terms', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  y = paragraph(
    doc,
    input.quote.terms ||
      'This is an estimate, not a tax invoice. Final pricing may change after consultation, product selection, or treatment-plan changes.',
    margin,
    y,
    maxW,
    line
  )

  return doc.output('arraybuffer')
}
