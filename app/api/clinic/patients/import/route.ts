import { NextRequest, NextResponse } from 'next/server'
import { readSheet } from 'read-excel-file/browser'
import { prisma } from '@/lib/prisma'
import {
  buildPatientImportCandidates,
  patientImportSummary,
  type PatientImportCandidate,
  type SpreadsheetCell,
} from '@/lib/clinic/patient-import'
import { getClinicSession } from '@/lib/clinic/session'

const MAX_IMPORT_ROWS = 1000

function parseCsv(text: string): SpreadsheetCell[][] {
  const rows: SpreadsheetCell[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

async function parseImportFile(file: File) {
  const name = file.name.toLowerCase()
  const arrayBuffer = await file.arrayBuffer()
  if (name.endsWith('.csv')) {
    return parseCsv(new TextDecoder().decode(arrayBuffer))
  }
  if (name.endsWith('.xlsx')) {
    return (await readSheet(arrayBuffer)) as SpreadsheetCell[][]
  }
  throw new Error('Unsupported file type')
}

async function existingPatientsForRows(tenantId: string, rows: PatientImportCandidate[]) {
  const emails = rows.map((row) => row.email).filter((value): value is string => Boolean(value))
  const phones = rows.map((row) => row.phone).filter((value): value is string => Boolean(value))
  if (emails.length === 0 && phones.length === 0) return []
  return prisma.clinicPatient.findMany({
    where: {
      tenantId,
      OR: [
        ...(emails.length > 0 ? [{ email: { in: emails, mode: 'insensitive' as const } }] : []),
        ...(phones.length > 0 ? [{ phone: { in: phones } }] : []),
      ],
    },
    select: { email: true, phone: true },
  })
}

function rowsToSpreadsheet(rows: PatientImportCandidate[]) {
  return [
    ['First name', 'Last name', 'Middle name', 'Date of birth', 'Phone', 'Email', 'Address', 'Area', 'Access notes', 'Category', 'Tags', 'Notes'],
    ...rows.map((row) => [
      row.firstName,
      row.lastName,
      row.middleName,
      row.dateOfBirth,
      row.phone,
      row.email,
      row.homeAddress,
      row.area,
      row.accessNotes,
      row.category,
      row.tags.join(','),
      row.internalNotes,
    ]),
  ]
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    let spreadsheetRows: SpreadsheetCell[][]
    try {
      spreadsheetRows = await parseImportFile(file)
    } catch {
      return NextResponse.json({ error: 'Upload .xlsx or .csv file' }, { status: 400 })
    }

    const preliminary = buildPatientImportCandidates(spreadsheetRows.slice(0, MAX_IMPORT_ROWS + 1))
    const existing = await existingPatientsForRows(session.tenantId, preliminary)
    const rows = buildPatientImportCandidates(spreadsheetRows.slice(0, MAX_IMPORT_ROWS + 1), existing)
    return NextResponse.json({
      rows,
      summary: patientImportSummary(rows),
      truncated: spreadsheetRows.length - 1 > MAX_IMPORT_ROWS,
      maxRows: MAX_IMPORT_ROWS,
    })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.action !== 'commit' || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: 'action=commit and rows are required' }, { status: 400 })
  }

  const submittedRows = body.rows.slice(0, MAX_IMPORT_ROWS) as PatientImportCandidate[]
  const preliminary = buildPatientImportCandidates(rowsToSpreadsheet(submittedRows))
  const existing = await existingPatientsForRows(session.tenantId, preliminary)
  const rows = buildPatientImportCandidates(rowsToSpreadsheet(submittedRows), existing)
  const importable = rows.filter((row) => row.errors.length === 0 && !row.duplicateReason)

  if (importable.length === 0) {
    return NextResponse.json({
      created: [],
      summary: {
        ...patientImportSummary(rows),
        created: 0,
        skipped: rows.length,
      },
    })
  }

  const created = await prisma.$transaction(
    importable.map((row) =>
      prisma.clinicPatient.create({
        data: {
          tenantId: session.tenantId,
          firstName: row.firstName,
          lastName: row.lastName,
          middleName: row.middleName,
          dateOfBirth: new Date(`${row.dateOfBirth}T12:00:00.000Z`),
          phone: row.phone,
          email: row.email,
          homeAddress: row.homeAddress,
          area: row.area,
          accessNotes: row.accessNotes,
          category: row.category,
          tags: row.tags,
          internalNotes: row.internalNotes,
        },
        select: { id: true, firstName: true, lastName: true },
      })
    )
  )

  return NextResponse.json({
    created,
    summary: {
      ...patientImportSummary(rows),
      created: created.length,
      skipped: rows.length - created.length,
    },
  })
}
