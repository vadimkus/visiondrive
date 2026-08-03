/**
 * End-to-end AMMÉ ops + CRM against a running deployment.
 * Usage: BASE_URL=https://visiondrive.ae npx tsx scripts/test-amme-e2e.ts
 */
export {}

const BASE = (process.env.BASE_URL || 'https://visiondrive.ae').replace(/\/$/, '')
const EMAIL = process.env.AMME_TASHA_EMAIL || 'tasha@amme.visiondrive.ae'
const PASS = process.env.AMME_TASHA_PASSWORD || 'AmmeTasha#2026Kp'

type Jar = Map<string, string>

function parseSetCookie(headers: Headers, jar: Jar) {
  const raw = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : []
  for (const c of raw) {
    const [pair] = c.split(';')
    const i = pair.indexOf('=')
    if (i > 0) jar.set(pair.slice(0, i), pair.slice(i + 1))
  }
}

function cookieHeader(jar: Jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

async function req(jar: Jar, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  if (jar.size) headers.set('cookie', cookieHeader(jar))
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  parseSetCookie(res.headers, jar)
  const text = await res.text()
  let json: any = null
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { res, json }
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

async function main() {
  const jar: Jar = new Map()
  const day = new Date().toISOString().slice(0, 10)
  const phone = `+62812${String(Date.now()).slice(-8)}`
  const name = `CRM E2E ${String(Date.now()).slice(-4)}`
  const steps: string[] = []

  const login = await req(jar, '/api/amme/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  })
  assert(login.res.ok && login.json.success, `login failed: ${JSON.stringify(login.json)}`)
  steps.push('login')

  const inventory = await req(jar, '/api/amme/manage', {
    method: 'POST',
    body: JSON.stringify({
      type: 'inventory_upsert',
      day,
      sku: 'E2E-INGREDIENT',
      name: 'E2E ingredient',
      unit: 'pcs',
      onHand: 100,
      reorderAt: 10,
      avgUnitCost: 5000,
    }),
  })
  assert(inventory.json.success, `inventory_upsert: ${inventory.json.error}`)
  const inventoryItem = inventory.json.management.inventory.find(
    (item: any) => item.sku === 'E2E-INGREDIENT'
  )
  assert(inventoryItem?.id, 'inventory item missing')

  const pkg = await req(jar, '/api/amme/manage', {
    method: 'POST',
    body: JSON.stringify({
      type: 'package_upsert',
      day,
      code: 'E2E-BANYA-5',
      name: 'E2E 5 visits',
      packageType: 'SESSION_PACK',
      price: 3600000,
      sessions: 5,
      creditValue: 0,
      validityDays: 180,
    }),
  })
  assert(pkg.json.success, `package_upsert: ${pkg.json.error}`)
  const packageItem = pkg.json.management.packages.find((item: any) => item.code === 'E2E-BANYA-5')
  assert(packageItem?.id, 'package missing')

  const automation = await req(jar, '/api/amme/manage', {
    method: 'POST',
    body: JSON.stringify({
      type: 'automation_upsert',
      day,
      name: 'E2E post-visit',
      trigger: 'close_tab',
      conditions: {},
      actions: { type: 'ADD_TAG', tag: 'E2E-follow-up' },
    }),
  })
  assert(automation.json.success, `automation_upsert: ${automation.json.error}`)
  steps.push('inventory+package+automation')

  const publicAvailability = await req(new Map(), `/api/amme/public/booking?day=${day}`)
  assert(
    publicAvailability.res.ok &&
      publicAvailability.json.success &&
      Array.isArray(publicAvailability.json.slots),
    'public availability failed'
  )
  const publicResource = publicAvailability.json.slots.find((slot: any) => slot.available)
  assert(publicResource?.resourceId, 'no public capacity resource')
  steps.push('public availability')

  const create = await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({
      type: 'booking_create',
      day,
      time: '15:45',
      name,
      guests: 2,
      banya: true,
      phone,
      resourceId: publicResource.resourceId,
      depositAmount: 200000,
      depositStatus: 'REQUIRED',
    }),
  })
  assert(create.json.success, `booking_create: ${create.json.error}`)
  const booking = [...(create.json.bookings || [])].reverse().find((b: any) => b.name === name)
  assert(booking?.guestId, 'booking missing guestId')
  steps.push('booking+guest')

  const arrive = await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({ type: 'arrive', bookingId: booking.id, day }),
  })
  assert(arrive.json.success, `arrive: ${arrive.json.error}`)
  const visit = (arrive.json.visits || []).find((v: any) => v.name === name)
  assert(visit?.guestId === booking.guestId, 'visit guestId mismatch')
  const tabId = visit.tabs[0].id
  const menuCode = (arrive.json.menu || []).find((m: any) => m.active)?.code
  const menuItem = (arrive.json.menu || []).find((m: any) => m.code === menuCode)
  assert(menuCode, 'no menu')
  steps.push('arrive')

  await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({ type: 'add_dish', tabId, menuCode, day }),
  })
  const recipe = await req(jar, '/api/amme/manage', {
    method: 'POST',
    body: JSON.stringify({
      type: 'recipe_set',
      day,
      menuItemId: menuItem.id,
      ingredients: [{ inventoryItemId: inventoryItem.id, quantity: 1 }],
    }),
  })
  assert(recipe.json.success, `recipe_set: ${recipe.json.error}`)
  await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({ type: 'send', tabId, day }),
  })
  const state = await req(jar, `/api/amme/state?day=${day}`)
  const sent = (state.json.kitchen || []).find(
    (k: any) => k.visitId === visit.id && k.status === 'SENT'
  )
  assert(sent, 'kitchen missing SENT line')
  await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({ type: 'done', lineId: sent.id, day }),
  })
  await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({ type: 'pay', tabId, paymentMethod: 'QRIS', day }),
  })
  await req(jar, '/api/amme/action', {
    method: 'POST',
    body: JSON.stringify({ type: 'close', tabId, day }),
  })
  steps.push('order→pay→close')

  const crm = await req(jar, `/api/amme/crm?q=${encodeURIComponent(phone)}`)
  assert(crm.json.success && crm.json.guests?.length >= 1, 'crm list empty')
  const guest = crm.json.guests[0]
  assert(guest.visitCount >= 1, 'visitCount not updated')
  assert(guest.lifetimeSpend > 0, 'lifetimeSpend not updated')
  steps.push('crm stats')

  const upd = await req(jar, '/api/amme/crm', {
    method: 'POST',
    body: JSON.stringify({
      type: 'update',
      guestId: guest.id,
      notes: 'любит тихий стол',
      vip: true,
      tags: ['VIP', 'Постоянный'],
      dietary: 'no pork',
    }),
  })
  assert(upd.json.success && upd.json.guest.vip, 'crm update failed')
  steps.push('crm update')

  const assigned = await req(jar, '/api/amme/manage', {
    method: 'POST',
    body: JSON.stringify({
      type: 'package_assign',
      day,
      guestId: guest.id,
      packageId: packageItem.id,
    }),
  })
  assert(assigned.json.success, `package_assign: ${assigned.json.error}`)
  steps.push('package assignment')

  const detail = await req(jar, `/api/amme/crm?id=${guest.id}`)
  assert(detail.json.history?.length >= 1, 'crm history empty')
  steps.push('crm history')

  const rfm = await req(jar, '/api/amme/manage', {
    method: 'POST',
    body: JSON.stringify({ type: 'rfm_recompute', day }),
  })
  assert(rfm.json.success, `rfm_recompute failed: ${rfm.json.error}`)
  assert(Array.isArray(rfm.json.management.resources), 'management resources missing')
  assert(
    rfm.json.management.payments.some((payment: any) => payment.tabId === tabId && payment.method === 'QRIS'),
    'payment ledger missing QRIS payment'
  )
  assert(typeof rfm.json.analytics.utilizationPct === 'number', 'owner BI missing utilization')
  const stockAfter = rfm.json.management.inventory.find(
    (item: any) => item.id === inventoryItem.id
  )
  assert(stockAfter.onHand === 99, `recipe consumption expected 99, got ${stockAfter.onHand}`)
  steps.push('capacity+payment ledger+RFM+owner BI')

  console.log(JSON.stringify({ ok: true, base: BASE, day, phone, guestId: guest.id, steps }, null, 2))
}

main().catch((e) => {
  console.error('E2E FAILED', e)
  process.exit(1)
})
