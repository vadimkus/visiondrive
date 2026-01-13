import jsPDF from 'jspdf'

// Types
interface EquipmentInfo {
  name: string
  type: string
  serialNumber: string
  modelName: string
  location: string
}

interface TemperatureReading {
  timestamp: Date
  temperature: number
  status: 'normal' | 'warning' | 'critical'
  humidity?: number
}

interface ReportData {
  kitchen: {
    legalName: string
    tradeName: string
    licenseNumber: string
    address: string
    emirate: string
    contactEmail: string
    contactPhone: string
  }
  equipment: EquipmentInfo
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    startDate: Date
    endDate: Date
  }
  readings: TemperatureReading[]
  compliance: {
    percentage: number
    totalReadings: number
    compliantReadings: number
    alerts: number
    criticalAlerts: number
  }
  thresholds: {
    min: number
    max: number
  }
}

// Color palette - Apple inspired
const COLORS = {
  primary: { r: 0, g: 0, b: 0 },           // Black
  secondary: { r: 134, g: 134, b: 139 },   // Gray
  accent: { r: 255, g: 149, b: 0 },        // Orange (VisionDrive brand)
  success: { r: 52, g: 199, b: 89 },       // Green
  warning: { r: 255, g: 204, b: 0 },       // Yellow
  danger: { r: 255, g: 59, b: 48 },        // Red
  background: { r: 250, g: 250, b: 250 },  // Light gray
  white: { r: 255, g: 255, b: 255 },
  border: { r: 229, g: 229, b: 234 },      // Light border
}

// Helper to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get status color
function getStatusColor(status: 'normal' | 'warning' | 'critical') {
  switch (status) {
    case 'normal': return COLORS.success
    case 'warning': return COLORS.warning
    case 'critical': return COLORS.danger
  }
}

// Generate professional PDF report
export function generateComplianceReport(data: ReportData, logoBase64?: string | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ===== HEADER =====
  // Orange accent bar at top
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b)
  doc.rect(0, 0, pageWidth, 5, 'F')

  y = 20

  // VD Logo from image file
  const logoWidth = 16
  const logoHeight = 16
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', margin, y - 12, logoWidth, logoHeight)
    } catch {
      // Fallback to text if image fails
      doc.setFillColor(42, 100, 100)
      doc.roundedRect(margin, y - 12, logoWidth, logoHeight, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('VD', margin + 4, y - 2)
    }
  } else {
    // Fallback to text logo
    doc.setFillColor(42, 100, 100)
    doc.roundedRect(margin, y - 12, logoWidth, logoHeight, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('VD', margin + 4, y - 2)
  }
  
  // VisionDrive text (Vision in slate, Drive in orange)
  const textStartX = margin + logoWidth + 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(51, 65, 85) // Slate-700 for "Vision"
  doc.text('Vision', textStartX, y - 2)
  const visionWidth = doc.getTextWidth('Vision')
  doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b) // Orange for "Drive"
  doc.text('Drive', textStartX + visionWidth, y - 2)
  
  // IoT Company (UAE) - no emoji for PDF compatibility
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  doc.text('IoT Company (UAE)', textStartX, y + 4)
  
  // Smart Kitchen badge on right
  doc.setFillColor(COLORS.background.r, COLORS.background.g, COLORS.background.b)
  doc.roundedRect(pageWidth - margin - 35, y - 11, 35, 8, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b)
  doc.setFont('helvetica', 'bold')
  doc.text('SMART KITCHEN', pageWidth - margin - 32, y - 6)
  
  // Report type below badge
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  const periodLabel = `${data.period.type.charAt(0).toUpperCase() + data.period.type.slice(1)} Compliance Report`
  doc.text(periodLabel, pageWidth - margin, y + 4, { align: 'right' })

  y += 12

  // Divider line
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  y += 10

  // ===== KITCHEN INFORMATION =====
  // Kitchen name (large)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text(data.kitchen.legalName, margin, y)
  
  y += 5
  
  // Trade name if different
  if (data.kitchen.tradeName !== data.kitchen.legalName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
    doc.text(`Trading as: ${data.kitchen.tradeName}`, margin, y)
    y += 5
  }

  y += 3
  
  // Kitchen details in two columns
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  
  const leftCol = margin
  const rightCol = pageWidth / 2 + 10
  
  doc.text(`License: ${data.kitchen.licenseNumber}`, leftCol, y)
  doc.text(`Phone: ${data.kitchen.contactPhone}`, rightCol, y)
  y += 4
  doc.text(`Address: ${data.kitchen.address}`, leftCol, y)
  doc.text(`Email: ${data.kitchen.contactEmail}`, rightCol, y)
  y += 4
  doc.text(`Emirate: ${data.kitchen.emirate}`, leftCol, y)

  y += 10

  // ===== REPORT PERIOD BOX =====
  doc.setFillColor(COLORS.background.r, COLORS.background.g, COLORS.background.b)
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text('Report Period', margin + 5, y + 6)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`${formatDate(data.period.startDate)} — ${formatDate(data.period.endDate)}`, margin + 5, y + 12)
  
  // Generated timestamp on right
  doc.setFontSize(8)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  doc.text(`Generated: ${formatDateTime(new Date())}`, pageWidth - margin - 5, y + 9, { align: 'right' })

  y += 22

  // ===== EQUIPMENT DETAILS =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text('Equipment Details', margin, y)
  
  y += 6
  
  // Equipment box
  doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b)
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD')
  
  const eqY = y + 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text(data.equipment.name, margin + 5, eqY)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  
  doc.text(`Type: ${data.equipment.type}`, margin + 5, eqY + 6)
  doc.text(`Model: ${data.equipment.modelName || 'Not specified'}`, margin + 60, eqY + 6)
  doc.text(`Serial No: ${data.equipment.serialNumber || 'Not specified'}`, margin + 5, eqY + 12)
  doc.text(`Location: ${data.equipment.location}`, margin + 60, eqY + 12)

  y += 30

  // ===== COMPLIANCE SUMMARY =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text('Compliance Summary', margin, y)
  
  y += 6
  
  // Compliance cards - 4 columns
  const cardWidth = (contentWidth - 9) / 4
  const cardHeight = 20
  const cards = [
    { 
      label: 'Compliance Rate', 
      value: `${data.compliance.percentage}%`,
      color: data.compliance.percentage >= 95 ? COLORS.success : 
             data.compliance.percentage >= 80 ? COLORS.warning : COLORS.danger
    },
    { label: 'Total Readings', value: data.compliance.totalReadings.toString(), color: COLORS.primary },
    { label: 'Compliant', value: data.compliance.compliantReadings.toString(), color: COLORS.success },
    { label: 'Alerts', value: data.compliance.alerts.toString(), color: data.compliance.alerts > 0 ? COLORS.warning : COLORS.success },
  ]
  
  cards.forEach((card, i) => {
    const cardX = margin + i * (cardWidth + 3)
    
    doc.setFillColor(COLORS.background.r, COLORS.background.g, COLORS.background.b)
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(card.color.r, card.color.g, card.color.b)
    doc.text(card.value, cardX + cardWidth / 2, y + 9, { align: 'center' })
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
    doc.text(card.label, cardX + cardWidth / 2, y + 15, { align: 'center' })
  })

  y += cardHeight + 8

  // Temperature thresholds note
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  doc.text(`Temperature Thresholds: ${data.thresholds.min}°C to ${data.thresholds.max}°C (per DM-HSD-GU46-KFPA2)`, margin, y)

  y += 10

  // ===== TEMPERATURE LOG TABLE =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text('Temperature Readings Log', margin, y)
  
  y += 5

  // Table header
  const colWidths = [35, 25, 30, 30, contentWidth - 120]
  const colX = [margin]
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i - 1] + colWidths[i - 1])
  }
  
  const headerHeight = 8
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.rect(margin, y, contentWidth, headerHeight, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b)
  
  const headers = ['Date', 'Time', 'Temperature', 'Status', 'Notes']
  headers.forEach((header, i) => {
    doc.text(header, colX[i] + 2, y + 5.5)
  })
  
  y += headerHeight

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const rowHeight = 6
  let rowCount = 0
  const maxRowsPerPage = 35
  
  data.readings.forEach((reading, index) => {
    // Check if we need a new page
    if (rowCount >= maxRowsPerPage || y + rowHeight > pageHeight - 25) {
      // Footer on current page
      addFooter(doc, pageWidth, pageHeight, margin)
      
      // New page
      doc.addPage()
      y = margin
      rowCount = 0
      
      // Add header on new page
      doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b)
      doc.rect(0, 0, pageWidth, 5, 'F')
      
      y = 15
      
      // VD Logo icon (smaller for continuation pages)
      doc.setFillColor(42, 100, 100)
      doc.roundedRect(margin, y - 6, 10, 10, 1.5, 1.5, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.text('VD', margin + 2.5, y)
      
      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(51, 65, 85)
      doc.text(`${data.equipment.name} — Temperature Readings (continued)`, margin + 14, y)
      
      y += 8
      
      // Reprint table header
      doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
      doc.rect(margin, y, contentWidth, headerHeight, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b)
      headers.forEach((header, i) => {
        doc.text(header, colX[i] + 2, y + 5.5)
      })
      
      y += headerHeight
      doc.setFont('helvetica', 'normal')
    }
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(COLORS.background.r, COLORS.background.g, COLORS.background.b)
      doc.rect(margin, y, contentWidth, rowHeight, 'F')
    }
    
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
    
    // Date
    doc.text(formatDate(reading.timestamp), colX[0] + 2, y + 4)
    
    // Time
    doc.text(formatTime(reading.timestamp), colX[1] + 2, y + 4)
    
    // Temperature
    const tempColor = getStatusColor(reading.status)
    doc.setTextColor(tempColor.r, tempColor.g, tempColor.b)
    doc.text(`${reading.temperature.toFixed(1)}°C`, colX[2] + 2, y + 4)
    
    // Status
    const statusText = reading.status.charAt(0).toUpperCase() + reading.status.slice(1)
    doc.text(statusText, colX[3] + 2, y + 4)
    
    // Notes
    doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
    let note = ''
    if (reading.status === 'warning') note = 'Approaching threshold'
    if (reading.status === 'critical') note = 'Threshold exceeded'
    if (reading.humidity) note = `Humidity: ${reading.humidity}%`
    doc.text(note, colX[4] + 2, y + 4)
    
    y += rowHeight
    rowCount++
  })

  y += 8

  // ===== CERTIFICATION STATEMENT =====
  if (y + 40 > pageHeight - 25) {
    addFooter(doc, pageWidth, pageHeight, margin)
    doc.addPage()
    y = margin + 10
  }
  
  doc.setFillColor(COLORS.background.r, COLORS.background.g, COLORS.background.b)
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.text('Certification Statement', margin + 5, y + 6)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  const certText = `This report is automatically generated by VisionDrive Smart Kitchen monitoring system. All temperature readings are recorded by calibrated IoT sensors (Dragino PS-NB) and stored in compliance with Dubai Municipality food safety requirements (DM-HSD-GU46-KFPA2). Data integrity is maintained through secure AWS infrastructure located in UAE.`
  const certLines = doc.splitTextToSize(certText, contentWidth - 10)
  doc.text(certLines, margin + 5, y + 12)

  // Footer
  addFooter(doc, pageWidth, pageHeight, margin)

  return doc
}

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
  const footerY = pageHeight - 10
  
  doc.setDrawColor(COLORS.border.r, COLORS.border.g, COLORS.border.b)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b)
  
  doc.text('VisionDrive Technologies FZ-LLC, Dubai, UAE', margin, footerY)
  doc.text('support@visiondrive.ae | visiondrive.ae', pageWidth / 2, footerY, { align: 'center' })
  
  const pageNum = doc.getNumberOfPages()
  doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: 'right' })
}

// Generate sample data for demo
export function generateSampleReportData(
  sensorName: string,
  sensorType: string,
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  serialNumber?: string,
  modelName?: string
): ReportData {
  const now = new Date()
  let startDate: Date
  let readingCount: number
  let intervalMinutes: number
  
  switch (periodType) {
    case 'daily':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      readingCount = 288 // Every 5 minutes
      intervalMinutes = 5
      break
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      readingCount = 168 // Hourly for 7 days
      intervalMinutes = 60
      break
    case 'monthly':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      readingCount = 240 // Every 3 hours for 30 days
      intervalMinutes = 180
      break
    case 'yearly':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      readingCount = 365 // Daily for a year
      intervalMinutes = 1440
      break
  }
  
  // Determine thresholds based on equipment type
  let minTemp = 0
  let maxTemp = 5
  if (sensorName.toLowerCase().includes('freezer')) {
    minTemp = -25
    maxTemp = -18
  } else if (sensorName.toLowerCase().includes('hot')) {
    minTemp = 60
    maxTemp = 75
  }
  
  // Generate readings
  const readings: TemperatureReading[] = []
  let compliantCount = 0
  let alertCount = 0
  
  for (let i = 0; i < readingCount; i++) {
    const timestamp = new Date(startDate.getTime() + i * intervalMinutes * 60 * 1000)
    
    // Generate realistic temperature with occasional variations
    const baseTemp = (minTemp + maxTemp) / 2
    const variation = (Math.random() - 0.5) * (maxTemp - minTemp) * 0.8
    let temperature = baseTemp + variation
    
    // Occasionally add warnings/criticals (5% chance)
    const rand = Math.random()
    let status: 'normal' | 'warning' | 'critical' = 'normal'
    
    if (rand < 0.02) {
      // Critical - 2% chance
      temperature = sensorName.toLowerCase().includes('freezer') 
        ? maxTemp + 2 + Math.random() * 3
        : sensorName.toLowerCase().includes('hot')
          ? minTemp - 5 - Math.random() * 5
          : maxTemp + 2 + Math.random() * 3
      status = 'critical'
      alertCount++
    } else if (rand < 0.05) {
      // Warning - 3% chance
      temperature = sensorName.toLowerCase().includes('freezer')
        ? maxTemp - 1 + Math.random() * 2
        : maxTemp - 0.5 + Math.random()
      status = 'warning'
      alertCount++
    } else {
      compliantCount++
    }
    
    readings.push({
      timestamp,
      temperature: Math.round(temperature * 10) / 10,
      status,
      humidity: sensorName.toLowerCase().includes('fridge') ? Math.round(45 + Math.random() * 20) : undefined,
    })
  }
  
  return {
    kitchen: {
      legalName: 'Al Baraka Restaurant & Cafe LLC',
      tradeName: 'The Golden Spoon',
      licenseNumber: 'DED-2024-123456',
      address: 'Shop 12, Al Wasl Road, Jumeirah 1',
      emirate: 'Dubai',
      contactEmail: 'manager@goldenspoon.ae',
      contactPhone: '+971 4 123 4567',
    },
    equipment: {
      name: sensorName,
      type: sensorType,
      serialNumber: serialNumber || 'SN-2024-001234',
      modelName: modelName || 'Dragino PS-NB-UAE',
      location: 'Main Kitchen',
    },
    period: {
      type: periodType,
      startDate,
      endDate: now,
    },
    readings,
    compliance: {
      percentage: Math.round((compliantCount / readingCount) * 100),
      totalReadings: readingCount,
      compliantReadings: compliantCount,
      alerts: alertCount,
      criticalAlerts: readings.filter(r => r.status === 'critical').length,
    },
    thresholds: {
      min: minTemp,
      max: maxTemp,
    },
  }
}

// Load logo as base64
async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logo/logo.jpg')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// Download helper
export async function downloadReport(data: ReportData): Promise<void> {
  const logoBase64 = await loadLogoBase64()
  const doc = generateComplianceReport(data, logoBase64)
  const fileName = `${data.equipment.name.replace(/\s+/g, '-')}_${data.period.type}_report_${formatDate(data.period.endDate).replace(/\s+/g, '-')}.pdf`
  doc.save(fileName)
}
