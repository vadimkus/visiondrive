import type { SpreadsheetCell } from './patient-import'

export type ProductImportCandidate = {
  rowNumber: number
  name: string
  sku: string | null
  barcode: string | null
  unit: string
  initialQuantity: number
  reorderPoint: number
  consumePerVisit: number
  procedureName: string | null
  procedureId: string | null
  supplier: string | null
  unitCost: string | null
  notes: string | null
  errors: string[]
  duplicateReason: string | null
}

type ExistingStockKey = {
  name?: string | null
  sku?: string | null
  barcode?: string | null
}

type ProcedureKey = {
  id: string
  name: string
}

const COLUMN_ALIASES = {
  name: ['name', 'product', 'item', 'stockitem', 'material', 'товар', 'продукт', 'материал', 'название'],
  sku: ['sku', 'article', 'articlenumber', 'код', 'артикул'],
  barcode: ['barcode', 'bar code', 'ean', 'qr', 'штрихкод', 'штрихкод'],
  unit: ['unit', 'uom', 'measure', 'единица', 'единицаизмерения'],
  initialQuantity: ['quantity', 'qty', 'onhand', 'stock', 'initialquantity', 'остаток', 'количество'],
  reorderPoint: ['reorderpoint', 'minstock', 'minimumstock', 'lowstock', 'минимум', 'точказаказа'],
  consumePerVisit: ['consumepervisit', 'pervisit', 'usage', 'списаниенавизит', 'расходнавизит'],
  procedureName: ['procedure', 'service', 'linkedprocedure', 'услуга', 'процедура'],
  supplier: ['supplier', 'vendor', 'поставщик'],
  unitCost: ['cost', 'unitcost', 'price', 'цена', 'себестоимость'],
  notes: ['notes', 'note', 'comment', 'comments', 'заметки', 'комментарий'],
} as const

function normalizeHeader(value: SpreadsheetCell) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, '')
}

function text(value: SpreadsheetCell, max = 500) {
  const normalized = String(value ?? '').trim().slice(0, max)
  return normalized || null
}

function numberValue(value: SpreadsheetCell, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value))
  const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback
}

function findColumn(headers: string[], aliases: readonly string[]) {
  return headers.findIndex((header) => aliases.includes(header))
}

function procedureLookup(procedures: ProcedureKey[]) {
  return new Map(procedures.map((procedure) => [procedure.name.trim().toLowerCase(), procedure.id]))
}

function notesWithCommercialContext(notes: string | null, supplier: string | null, unitCost: string | null) {
  const parts = []
  if (supplier) parts.push(`Supplier: ${supplier}`)
  if (unitCost) parts.push(`Unit cost: ${unitCost}`)
  if (notes) parts.push(notes)
  return parts.join('\n') || null
}

export function buildProductImportCandidates(
  rows: SpreadsheetCell[][],
  existingItems: ExistingStockKey[] = [],
  procedures: ProcedureKey[] = []
) {
  if (rows.length < 2) return []
  const headers = rows[0].map(normalizeHeader)
  const column = Object.fromEntries(
    Object.entries(COLUMN_ALIASES).map(([key, aliases]) => [key, findColumn(headers, aliases)])
  ) as Record<keyof typeof COLUMN_ALIASES, number>

  const existingNames = new Set(existingItems.map((item) => item.name?.trim().toLowerCase()).filter(Boolean))
  const existingSkus = new Set(existingItems.map((item) => item.sku?.trim().toLowerCase()).filter(Boolean))
  const existingBarcodes = new Set(existingItems.map((item) => item.barcode?.trim()).filter(Boolean))
  const seenNames = new Set<string>()
  const seenSkus = new Set<string>()
  const seenBarcodes = new Set<string>()
  const proceduresByName = procedureLookup(procedures)

  return rows.slice(1).map((row, index): ProductImportCandidate => {
    const at = (key: keyof typeof COLUMN_ALIASES) => (column[key] >= 0 ? row[column[key]] : null)
    const name = text(at('name'), 200) ?? ''
    const sku = text(at('sku'), 120)
    const barcode = text(at('barcode'), 120)
    const unit = text(at('unit'), 40) ?? 'unit'
    const initialQuantity = numberValue(at('initialQuantity'), 0)
    const reorderPoint = numberValue(at('reorderPoint'), 0)
    const consumePerVisit = numberValue(at('consumePerVisit'), 0)
    const procedureName = text(at('procedureName'), 200)
    const procedureId = procedureName ? proceduresByName.get(procedureName.toLowerCase()) ?? null : null
    const supplier = text(at('supplier'), 200)
    const unitCost = text(at('unitCost'), 80)
    const baseNotes = text(at('notes'), 2000)
    const errors: string[] = []
    let duplicateReason: string | null = null

    if (!name) errors.push('name_missing')
    if (!unit) errors.push('unit_missing')
    if (procedureName && !procedureId) errors.push('procedure_not_found')

    const nameKey = name.trim().toLowerCase()
    const skuKey = sku?.trim().toLowerCase() ?? null
    const barcodeKey = barcode?.trim() ?? null

    if (barcodeKey && existingBarcodes.has(barcodeKey)) duplicateReason = 'existing_barcode'
    if (!duplicateReason && skuKey && existingSkus.has(skuKey)) duplicateReason = 'existing_sku'
    if (!duplicateReason && nameKey && existingNames.has(nameKey)) duplicateReason = 'existing_name'
    if (!duplicateReason && barcodeKey && seenBarcodes.has(barcodeKey)) duplicateReason = 'file_barcode'
    if (!duplicateReason && skuKey && seenSkus.has(skuKey)) duplicateReason = 'file_sku'
    if (!duplicateReason && nameKey && seenNames.has(nameKey)) duplicateReason = 'file_name'

    if (nameKey) seenNames.add(nameKey)
    if (skuKey) seenSkus.add(skuKey)
    if (barcodeKey) seenBarcodes.add(barcodeKey)

    return {
      rowNumber: index + 2,
      name,
      sku,
      barcode,
      unit,
      initialQuantity,
      reorderPoint,
      consumePerVisit,
      procedureName,
      procedureId,
      supplier,
      unitCost,
      notes: notesWithCommercialContext(baseNotes, supplier, unitCost),
      errors,
      duplicateReason,
    }
  })
}

export function productImportSummary(rows: ProductImportCandidate[]) {
  const validRows = rows.filter((row) => row.errors.length === 0)
  const duplicates = rows.filter((row) => row.duplicateReason)
  return {
    total: rows.length,
    valid: validRows.length,
    importable: validRows.filter((row) => !row.duplicateReason).length,
    duplicates: duplicates.length,
    invalid: rows.filter((row) => row.errors.length > 0).length,
  }
}
