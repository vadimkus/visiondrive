import { describe, expect, it } from 'vitest'
import { buildRetailRecommendations } from '@/lib/clinic/retail-recommendations'

describe('retail recommendations', () => {
  it('prioritizes service-linked products', () => {
    const recommendations = buildRetailRecommendations({
      procedureId: 'proc_skin',
      items: [
        {
          id: 'spf',
          name: 'SPF cream',
          sku: 'SPF',
          unit: 'pcs',
          quantityOnHand: 5,
          active: true,
          procedureId: 'proc_skin',
          procedure: { id: 'proc_skin', name: 'Skin treatment' },
        },
        {
          id: 'cleanser',
          name: 'Cleanser',
          sku: 'C',
          unit: 'pcs',
          quantityOnHand: 20,
          active: true,
        },
      ],
    })

    expect(recommendations[0]).toMatchObject({
      id: 'spf',
      reason: 'SERVICE_MATCH',
    })
  })

  it('uses patient repeat purchases and last sale price', () => {
    const recommendations = buildRetailRecommendations({
      patientId: 'patient_1',
      items: [
        {
          id: 'serum',
          name: 'Serum',
          unit: 'pcs',
          quantityOnHand: 3,
          active: true,
        },
      ],
      recentSaleLines: [
        {
          stockItemId: 'serum',
          quantity: 2,
          unitPriceCents: 18000,
          productSale: { patientId: 'patient_1', soldAt: new Date() },
        },
      ],
    })

    expect(recommendations[0]).toMatchObject({
      id: 'serum',
      reason: 'PATIENT_REPEAT',
      lastUnitPriceCents: 18000,
    })
  })

  it('excludes inactive and out-of-stock products', () => {
    const recommendations = buildRetailRecommendations({
      items: [
        { id: 'inactive', name: 'Inactive', unit: 'pcs', quantityOnHand: 10, active: false },
        { id: 'empty', name: 'Empty', unit: 'pcs', quantityOnHand: 0, active: true },
      ],
    })

    expect(recommendations).toEqual([])
  })
})
