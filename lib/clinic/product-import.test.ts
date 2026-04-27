import { describe, expect, it } from 'vitest'
import { buildProductImportCandidates, productImportSummary } from './product-import'

describe('product import', () => {
  it('maps stock spreadsheet rows into import candidates', () => {
    const rows = [
      ['Product', 'SKU', 'Barcode', 'Unit', 'Quantity', 'Min stock', 'Supplier', 'Cost', 'Procedure'],
      ['Serum ampoule', 'SER-1', '12345', 'pcs', 12, 3, 'Beauty Supply', '15 AED', 'Facial'],
    ]

    const [candidate] = buildProductImportCandidates(rows, [], [{ id: 'proc_1', name: 'Facial' }])

    expect(candidate).toMatchObject({
      rowNumber: 2,
      name: 'Serum ampoule',
      sku: 'SER-1',
      barcode: '12345',
      unit: 'pcs',
      initialQuantity: 12,
      reorderPoint: 3,
      procedureId: 'proc_1',
      supplier: 'Beauty Supply',
      unitCost: '15 AED',
      errors: [],
      duplicateReason: null,
    })
    expect(candidate.notes).toContain('Supplier: Beauty Supply')
    expect(candidate.notes).toContain('Unit cost: 15 AED')
  })

  it('detects invalid procedures and duplicate product identifiers', () => {
    const rows = [
      ['Name', 'SKU', 'Barcode', 'Unit', 'Procedure'],
      ['Existing', 'EX-1', '111', 'unit', 'Facial'],
      ['Duplicate barcode', 'NEW-1', '111', 'unit', 'Unknown'],
      ['', 'NO-NAME', '222', 'unit', 'Facial'],
    ]

    const candidates = buildProductImportCandidates(
      rows,
      [{ name: 'Existing', sku: 'EX-1', barcode: '999' }],
      [{ id: 'proc_1', name: 'Facial' }]
    )

    expect(candidates[0].duplicateReason).toBe('existing_sku')
    expect(candidates[1].duplicateReason).toBe('file_barcode')
    expect(candidates[1].errors).toContain('procedure_not_found')
    expect(candidates[2].errors).toContain('name_missing')
    expect(productImportSummary(candidates)).toEqual({
      total: 3,
      valid: 1,
      importable: 0,
      duplicates: 2,
      invalid: 2,
    })
  })
})
