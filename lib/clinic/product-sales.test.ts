import { describe, expect, it } from 'vitest'
import {
  isProductSalePaymentReference,
  normalizeSalePriceCents,
  normalizeSaleQuantity,
  productSaleLineTotalCents,
  productSalePaymentReference,
  productSaleTotalCents,
} from './product-sales'

describe('product sales helpers', () => {
  it('normalizes quantities and prices', () => {
    expect(normalizeSaleQuantity('2')).toBe(2)
    expect(normalizeSaleQuantity(0)).toBe(1)
    expect(normalizeSaleQuantity(1.6)).toBe(2)
    expect(normalizeSalePriceCents('1250')).toBe(1250)
    expect(normalizeSalePriceCents(-1)).toBe(0)
  })

  it('calculates line and sale totals with capped discounts', () => {
    expect(productSaleLineTotalCents({ quantity: 3, unitPriceCents: 1500 })).toBe(4500)
    expect(
      productSaleTotalCents(
        [
          { quantity: 2, unitPriceCents: 1000 },
          { quantity: 1, unitPriceCents: 750 },
        ],
        500
      )
    ).toEqual({ subtotalCents: 2750, discountCents: 500, totalCents: 2250 })
    expect(productSaleTotalCents([{ quantity: 1, unitPriceCents: 1000 }], 5000)).toEqual({
      subtotalCents: 1000,
      discountCents: 1000,
      totalCents: 0,
    })
  })

  it('marks product-sale payment references', () => {
    const reference = productSalePaymentReference('sale_1')
    expect(reference).toBe('PRODUCT_SALE:sale_1')
    expect(isProductSalePaymentReference(reference)).toBe(true)
    expect(isProductSalePaymentReference('PACKAGE:x')).toBe(false)
  })
})
