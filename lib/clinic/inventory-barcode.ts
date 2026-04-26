import { prisma } from '@/lib/prisma'

export function normalizeBarcode(raw: unknown): string | null {
  if (raw == null) return null
  const s = String(raw).trim()
  return s.length ? s : null
}

export async function assertBarcodeAvailable(
  tenantId: string,
  barcode: string | null,
  excludeItemId?: string
): Promise<void> {
  if (!barcode) return
  const dup = await prisma.clinicStockItem.findFirst({
    where: {
      tenantId,
      barcode,
      ...(excludeItemId ? { NOT: { id: excludeItemId } } : {}),
    },
    select: { id: true },
  })
  if (dup) {
    throw new Error('BARCODE_IN_USE')
  }
}
