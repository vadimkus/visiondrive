import { NextRequest, NextResponse } from 'next/server'
import { readSheet } from 'read-excel-file/browser'
import { prisma } from '@/lib/prisma'
import {
  buildProductImportCandidates,
  productImportSummary,
  type ProductImportCandidate,
} from '@/lib/clinic/product-import'
import type { SpreadsheetCell } from '@/lib/clinic/patient-import'
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

async function importContext(tenantId: string) {
  const [items, procedures] = await Promise.all([
    prisma.clinicStockItem.findMany({
      where: { tenantId },
      select: { name: true, sku: true, barcode: true },
    }),
    prisma.clinicProcedure.findMany({
      where: { tenantId, active: true },
      select: { id: true, name: true },
    }),
  ])
  return { items, procedures }
}

function rowsToSpreadsheet(rows: ProductImportCandidate[]) {
  return [
    ['Name', 'SKU', 'Barcode', 'Unit', 'Quantity', 'Reorder point', 'Consume per visit', 'Procedure', 'Supplier', 'Unit cost', 'Notes'],
    ...rows.map((row) => [
      row.name,
      row.sku,
      row.barcode,
      row.unit,
      row.initialQuantity,
      row.reorderPoint,
      row.consumePerVisit,
      row.procedureName,
      row.supplier,
      row.unitCost,
      row.notes,
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

    const { items, procedures } = await importContext(session.tenantId)
    const rows = buildProductImportCandidates(
      spreadsheetRows.slice(0, MAX_IMPORT_ROWS + 1),
      items,
      procedures
    )
    return NextResponse.json({
      rows,
      summary: productImportSummary(rows),
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

  const submittedRows = body.rows.slice(0, MAX_IMPORT_ROWS) as ProductImportCandidate[]
  const { items, procedures } = await importContext(session.tenantId)
  const rows = buildProductImportCandidates(rowsToSpreadsheet(submittedRows), items, procedures)
  const importable = rows.filter((row) => row.errors.length === 0 && !row.duplicateReason)

  if (importable.length === 0) {
    return NextResponse.json({
      created: [],
      summary: {
        ...productImportSummary(rows),
        created: 0,
        skipped: rows.length,
      },
    })
  }

  const created = await prisma.$transaction(
    importable.map((row) =>
      prisma.clinicStockItem.create({
        data: {
          tenantId: session.tenantId,
          name: row.name,
          sku: row.sku,
          barcode: row.barcode,
          unit: row.unit,
          reorderPoint: row.reorderPoint,
          quantityOnHand: row.initialQuantity,
          consumePerVisit: row.consumePerVisit,
          procedureId: row.procedureId,
          notes: row.notes,
          movements:
            row.initialQuantity > 0
              ? {
                  create: {
                    tenantId: session.tenantId,
                    type: 'RECEIPT',
                    quantityDelta: row.initialQuantity,
                    note: 'Opening balance from import',
                  },
                }
              : undefined,
        },
        select: { id: true, name: true },
      })
    )
  )

  return NextResponse.json({
    created,
    summary: {
      ...productImportSummary(rows),
      created: created.length,
      skipped: rows.length - created.length,
    },
  })
}
