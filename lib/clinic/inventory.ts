/** True when reorder threshold is set and on-hand is at or below it. */
export function isClinicStockLow(item: {
  quantityOnHand: number
  reorderPoint: number
  active: boolean
}): boolean {
  return item.active && item.reorderPoint > 0 && item.quantityOnHand <= item.reorderPoint
}
