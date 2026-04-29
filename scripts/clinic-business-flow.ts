/**
 * End-to-end clinic business flow via HTTP (no browser).
 * Requires: `npm run dev` and a seeded DB (e.g. admin / admin5 from prisma/seed.ts).
 *
 *   CLINIC_E2E_BASE_URL=http://127.0.0.1:3000 CLINIC_E2E_EMAIL=admin CLINIC_E2E_PASSWORD=admin5 npx tsx scripts/clinic-business-flow.ts
 */

const BASE = (process.env.CLINIC_E2E_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const EMAIL = process.env.CLINIC_E2E_EMAIL || 'admin'
const PASSWORD = process.env.CLINIC_E2E_PASSWORD || 'admin5'
const E2E_IP = `127.0.0.${Math.max(2, (Date.now() % 240) + 2)}`

/** 1×1 transparent PNG */
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

function nextWeekdayAt(daysAhead: number, hour: number, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1)
  }
  d.setHours(hour, minute, 0, 0)
  return d
}

function weekdayAfter(base: Date, daysAhead: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + daysAhead)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

function cookieHeaderFromResponse(res: Response, existing = ''): string {
  const map = new Map<string, string>()
  for (const part of existing.split(';').map((s) => s.trim()).filter(Boolean)) {
    const eq = part.indexOf('=')
    if (eq > 0) map.set(part.slice(0, eq), part.slice(eq + 1))
  }
  const h = res.headers as Headers & { getSetCookie?: () => string[] }
  const lines = typeof h.getSetCookie === 'function' ? h.getSetCookie() : []
  for (const line of lines) {
    const nv = line.split(';')[0].trim()
    const eq = nv.indexOf('=')
    if (eq > 0) map.set(nv.slice(0, eq), nv.slice(eq + 1))
  }
  if (lines.length === 0) {
    const single = res.headers.get('set-cookie')
    if (single) {
      for (const segment of single.split(/,(?=[^;]+?=)/)) {
        const nv = segment.split(';')[0].trim()
        const eq = nv.indexOf('=')
        if (eq > 0) map.set(nv.slice(0, eq), nv.slice(eq + 1))
      }
    }
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

async function req(
  path: string,
  init: RequestInit & { cookie?: string } = {}
): Promise<Response> {
  const { cookie, ...rest } = init
  const headers = new Headers(rest.headers)
  if (cookie) headers.set('Cookie', cookie)
  headers.set('x-forwarded-for', E2E_IP)
  return fetch(`${BASE}${path}`, { ...rest, headers })
}

async function main() {
  console.log(`Clinic business flow → ${BASE}\n`)

  // 0) Server up
  let ping: Response
  try {
    ping = await req('/api/auth/me', { method: 'GET' })
  } catch (e) {
    throw new Error(
      `Cannot reach ${BASE}. Start the app: npm run dev\n${e instanceof Error ? e.message : e}`
    )
  }
  assert(ping.status === 401 || ping.status === 200, `Unexpected /api/auth/me: ${ping.status}`)
  console.log('✓ Server responds')

  // 1) Login
  const loginRes = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, portal: 'clinic' }),
  })
  const loginJson = await loginRes.json()
  assert(loginRes.ok && loginJson.success, `Login failed (${loginRes.status}): ${JSON.stringify(loginJson)}`)
  let cookie = cookieHeaderFromResponse(loginRes)
  assert(cookie.includes('authToken='), 'No authToken cookie after login')
  console.log(`✓ Clinic login (${EMAIL})`)

  // 2) Stats
  const statsRes = await req('/api/clinic/stats', { cookie })
  const statsJson = await statsRes.json()
  assert(statsRes.ok, `stats ${statsRes.status}`)
  assert(typeof statsJson.lowStockCount === 'number', 'stats should include lowStockCount')
  console.log('✓ GET /api/clinic/stats')

  // 3) Me
  const meRes = await req('/api/clinic/me', { cookie })
  assert(meRes.ok, `me ${meRes.status}`)
  console.log('✓ GET /api/clinic/me')

  const suffix = `e2e-${Date.now()}`

  // 4) Create patient
  const patientRes = await req('/api/clinic/patients', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Flow',
      lastName: suffix,
      dateOfBirth: '1990-06-15',
      phone: '+971500000001',
      email: `${suffix}@example.test`,
      internalNotes: 'E2E seed patient',
    }),
  })
  const patientJson = await patientRes.json()
  assert(patientRes.status === 201, `patient create ${patientRes.status}: ${JSON.stringify(patientJson)}`)
  const patientId = patientJson.patient?.id as string
  assert(patientId, 'No patient id')
  console.log('✓ POST patient')

  // 5) Create procedure
  const procRes = await req('/api/clinic/procedures', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `E2E Procedure ${suffix}`,
      defaultDurationMin: 45,
      basePriceCents: 50000,
      currency: 'AED',
    }),
  })
  const procJson = await procRes.json()
  assert(procRes.status === 201, `procedure ${procRes.status}: ${JSON.stringify(procJson)}`)
  const procedureId = procJson.procedure?.id as string
  assert(procedureId, 'No procedure id')
  console.log('✓ POST procedure')

  const policyRes = await req(`/api/clinic/procedures/${procedureId}`, {
    method: 'PATCH',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingPolicyType: 'DEPOSIT',
      depositAmountCents: 10000,
      cancellationWindowHours: 24,
      lateCancelFeeCents: 15000,
      noShowFeeCents: 25000,
      bookingPolicyText: 'E2E policy: deposit and cancellation terms accepted before booking.',
    }),
  })
  const policyJson = await policyRes.json()
  assert(policyRes.ok, `policy patch ${policyRes.status}: ${JSON.stringify(policyJson)}`)
  console.log('✓ PATCH procedure booking policy')

  // 5b) Stock linked to procedure (auto-deduct on completed visit with appointment)
  const preStockRes = await req('/api/clinic/inventory', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `E2E Visit stock ${suffix}`,
      sku: `SKU-VISIT-${suffix}`,
      barcode: `BC-${suffix}`,
      unit: 'vial',
      reorderPoint: 20,
      initialQuantity: 25,
      consumePerVisit: 2,
      procedureId,
      notes: 'E2E visit consumption',
    }),
  })
  const preStockJson = await preStockRes.json()
  assert(preStockRes.status === 201, `pre-visit stock ${preStockRes.status}: ${JSON.stringify(preStockJson)}`)
  const preStockId = preStockJson.item?.id as string
  assert(preStockId, 'No pre-visit stock id')
  console.log('✓ POST inventory (procedure-linked, consumePerVisit)')

  // 6) Appointment tomorrow 10:00 local
  const uniqueSeed = Number(suffix.replace('e2e-', '')) || Date.now()
  const start = nextWeekdayAt(
    21 + (uniqueSeed % 10),
    9 + (uniqueSeed % 7),
    (Math.floor(uniqueSeed / 7) % 6) * 10
  )
  const blockedPolicyRes = await req('/api/clinic/appointments', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      procedureId,
      startsAt: start.toISOString(),
      internalNotes: 'E2E appointment',
    }),
  })
  const blockedPolicyJson = await blockedPolicyRes.json()
  assert(
    blockedPolicyRes.status === 400,
    `policy acceptance should block appointment ${blockedPolicyRes.status}: ${JSON.stringify(blockedPolicyJson)}`
  )
  console.log('✓ Booking policy blocks appointment without acceptance')

  const apptRes = await req('/api/clinic/appointments', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      procedureId,
      startsAt: start.toISOString(),
      internalNotes: 'E2E appointment',
      bookingPolicyAccepted: true,
    }),
  })
  const apptJson = await apptRes.json()
  assert(apptRes.status === 201, `appointment ${apptRes.status}: ${JSON.stringify(apptJson)}`)
  const appointmentId = apptJson.appointment?.id as string
  assert(appointmentId, 'No appointment id')
  console.log('✓ POST appointment')

  // 7) Full chart
  const chartRes = await req(`/api/clinic/patients/${patientId}`, { cookie })
  const chartJson = await chartRes.json()
  assert(chartRes.ok, `chart ${chartRes.status}`)
  assert(chartJson.patient?.appointments?.length >= 1, 'Chart missing appointment')
  console.log('✓ GET patient chart')

  // 7b) Anamnesis (structured history)
  const anamnesisRes = await req(`/api/clinic/patients/${patientId}`, {
    method: 'PATCH',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anamnesisJson: {
        allergies: 'E2E test allergy',
        medications: 'None',
        conditions: 'Healthy',
        social: 'Non-smoker',
      },
    }),
  })
  const anamnesisJson = await anamnesisRes.json()
  assert(anamnesisRes.ok, `anamnesis patch ${anamnesisRes.status}: ${JSON.stringify(anamnesisJson)}`)
  assert(
    (anamnesisJson.patient?.anamnesisJson as { conditions?: string })?.conditions === 'Healthy',
    'Anamnesis not persisted'
  )
  console.log('✓ PATCH patient anamnesis')

  // 7c) Patient-safe summary PDF
  const pdfRes = await req(`/api/clinic/patients/${patientId}/summary-pdf`, { cookie })
  assert(pdfRes.ok, `summary pdf ${pdfRes.status}`)
  const pdfCt = pdfRes.headers.get('content-type') || ''
  assert(pdfCt.includes('pdf'), `expected application/pdf, got ${pdfCt}`)
  const pdfBuf = await pdfRes.arrayBuffer()
  assert(pdfBuf.byteLength > 400, 'PDF too small')
  const pdfMagic = new TextDecoder('latin1').decode(pdfBuf.slice(0, 5))
  assert(pdfMagic.startsWith('%PDF'), 'invalid PDF header')
  console.log('✓ GET patient summary PDF')

  // 8) Visit
  const visitAt = new Date()
  visitAt.setMinutes(visitAt.getMinutes() - visitAt.getTimezoneOffset())
  const visitRes = await req('/api/clinic/visits', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      appointmentId,
      visitAt: new Date().toISOString(),
      status: 'COMPLETED',
      chiefComplaint: 'E2E checkup',
      procedureSummary: 'Consultation',
      nextSteps: 'Follow-up in 2 weeks',
      staffNotes: 'E2E staff note',
    }),
  })
  const visitJson = await visitRes.json()
  assert(visitRes.status === 201, `visit ${visitRes.status}: ${JSON.stringify(visitJson)}`)
  const visitId = visitJson.visit?.id as string
  assert(visitId, 'No visit id')
  const deducted = visitJson.inventoryDeduction?.deducted as { itemId: string; qty: number }[] | undefined
  assert(deducted && deducted.some((d) => d.itemId === preStockId && d.qty === 2), 'Visit should auto-deduct consumePerVisit')
  console.log('✓ POST visit (inventory auto-deduct)')

  const preStockCheck = await req(`/api/clinic/inventory/${preStockId}`, { cookie })
  const preStockCheckJson = await preStockCheck.json()
  assert(preStockCheck.ok, `get stock ${preStockCheck.status}`)
  assert(preStockCheckJson.item?.quantityOnHand === 23, 'Expected 25 - 2 = 23 on hand after visit')
  console.log('✓ GET inventory after visit (on-hand 23)')

  // 9) Media upload
  const fd = new FormData()
  fd.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'e2e.png')
  fd.append('kind', 'BEFORE')
  fd.append('visitId', visitId)
  const mediaRes = await req(`/api/clinic/patients/${patientId}/media`, {
    method: 'POST',
    cookie,
    body: fd,
  })
  const mediaJson = await mediaRes.json()
  assert(mediaRes.status === 201, `media ${mediaRes.status}: ${JSON.stringify(mediaJson)}`)
  const mediaId = mediaJson.media?.id as string
  assert(mediaId, 'No media id')
  console.log('✓ POST patient media')

  const imgRes = await req(`/api/clinic/media/${mediaId}`, { cookie })
  assert(imgRes.ok, `GET media binary ${imgRes.status}`)
  const imgBuf = Buffer.from(await imgRes.arrayBuffer())
  assert(imgBuf.length >= 8 && imgBuf[0] === 0x89 && imgBuf[1] === 0x50, 'Media response is not PNG')
  console.log('✓ GET /api/clinic/media/[id] (binary)')

  // 10) Payment
  const payRes = await req(`/api/clinic/patients/${patientId}/payments`, {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amountCents: 12500,
      currency: 'AED',
      method: 'CARD',
      status: 'PAID',
      visitId,
      paidAt: new Date().toISOString(),
      note: 'E2E payment',
    }),
  })
  const payJson = await payRes.json()
  assert(payRes.status === 201, `payment ${payRes.status}: ${JSON.stringify(payJson)}`)
  console.log('✓ POST payment')

  // 11) CRM
  const crmRes = await req(`/api/clinic/patients/${patientId}/crm`, {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'NOTE',
      body: 'E2E CRM note — thanks for visiting',
      occurredAt: new Date().toISOString(),
    }),
  })
  const crmJson = await crmRes.json()
  assert(crmRes.status === 201, `crm ${crmRes.status}: ${JSON.stringify(crmJson)}`)
  console.log('✓ POST CRM')

  // 12) Reschedule appointment (+2 days, same clock)
  const patchStart = weekdayAfter(start, 2)
  const patchRes = await req(`/api/clinic/appointments/${appointmentId}`, {
    method: 'PATCH',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startsAt: patchStart.toISOString() }),
  })
  const patchJson = await patchRes.json()
  assert(patchRes.ok, `PATCH appointment ${patchRes.status}: ${JSON.stringify(patchJson)}`)
  console.log('✓ PATCH appointment (reschedule)')

  // 13) List appointments in window
  const from = new Date(start)
  from.setDate(from.getDate() - 1)
  from.setHours(0, 0, 0, 0)
  const to = new Date(patchStart)
  to.setDate(to.getDate() + 7)
  const listRes = await req(
    `/api/clinic/appointments?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
    { cookie }
  )
  const listJson = await listRes.json()
  assert(listRes.ok, `list appts ${listRes.status}`)
  const ids = (listJson.appointments || []).map((a: { id: string }) => a.id)
  assert(ids.includes(appointmentId), 'Rescheduled appointment not in range query')
  console.log('✓ GET appointments (range includes rescheduled)')

  // 14) Patient search
  const searchRes = await req(`/api/clinic/patients?q=${encodeURIComponent(suffix)}`, { cookie })
  const searchJson = await searchRes.json()
  assert(searchRes.ok, `search ${searchRes.status}`)
  assert(
    (searchJson.patients || []).some((p: { id: string }) => p.id === patientId),
    'Search did not find patient'
  )
  console.log('✓ GET patients?q=')

  // 15) Inventory: second item (no procedure link — avoids double visit deduction), movements, low-stock list
  const invRes = await req('/api/clinic/inventory', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `E2E Stock ${suffix}`,
      sku: `SKU-${suffix}`,
      unit: 'vial',
      reorderPoint: 20,
      initialQuantity: 15,
      notes: 'E2E inventory',
    }),
  })
  const invJson = await invRes.json()
  assert(invRes.status === 201, `inventory create ${invRes.status}: ${JSON.stringify(invJson)}`)
  const stockId = invJson.item?.id as string
  assert(stockId, 'No stock item id')

  const movRes = await req(`/api/clinic/inventory/${stockId}/movements`, {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'CONSUMPTION',
      quantityDelta: -10,
      note: 'E2E consumption',
    }),
  })
  const movJson = await movRes.json()
  assert(movRes.status === 201, `inventory movement ${movRes.status}: ${JSON.stringify(movJson)}`)
  assert(movJson.item?.quantityOnHand === 5, 'Expected on-hand 5 after consumption')

  const lowListRes = await req('/api/clinic/inventory?lowStock=1', { cookie })
  const lowListJson = await lowListRes.json()
  assert(lowListRes.ok, `inventory lowStock ${lowListRes.status}`)
  assert(
    (lowListJson.items || []).some((i: { id: string }) => i.id === stockId),
    'Item should appear in low-stock filter (5 <= 20)'
  )
  console.log('✓ Inventory + movements + low-stock filter')

  // 16) Purchase order + receive (stock movement RECEIPT)
  const poRes = await req('/api/clinic/purchase-orders', {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supplierName: `E2E Supplier ${suffix}`,
      reference: `PO-${suffix}`,
      lines: [{ stockItemId: stockId, quantityOrdered: 4, unitCostCents: 100 }],
    }),
  })
  const poJson = await poRes.json()
  assert(poRes.status === 201, `PO create ${poRes.status}: ${JSON.stringify(poJson)}`)
  const poId = poJson.order?.id as string
  const poLineId = poJson.order?.lines?.[0]?.id as string
  assert(poId && poLineId, 'PO ids missing')

  const recvRes = await req(`/api/clinic/purchase-orders/${poId}/receive`, {
    method: 'POST',
    cookie,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ lineId: poLineId, quantity: 4 }],
      receiptNote: 'E2E receive',
    }),
  })
  const recvJson = await recvRes.json()
  assert(recvRes.ok, `PO receive ${recvRes.status}: ${JSON.stringify(recvJson)}`)
  assert(recvJson.order?.status === 'RECEIVED', 'PO should be fully received')
  const afterPo = await req(`/api/clinic/inventory/${stockId}`, { cookie })
  const afterPoJson = await afterPo.json()
  assert(afterPoJson.item?.quantityOnHand === 9, 'Expected 5 + 4 = 9 after PO receipt')
  console.log('✓ Purchase order + receive into stock')

  const lookupRes = await req(`/api/clinic/inventory/lookup?q=${encodeURIComponent(`BC-${suffix}`)}`, {
    cookie,
  })
  const lookupJson = await lookupRes.json()
  assert(lookupRes.ok && lookupJson.item?.id === preStockId, 'Barcode lookup should resolve visit stock item')
  console.log('✓ GET inventory/lookup (barcode)')

  console.log('\nAll clinic business steps passed (A→Z).')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
