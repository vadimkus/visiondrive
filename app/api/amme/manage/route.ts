import { NextRequest, NextResponse } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'
import { assertAmmePermission, type AmmePermission } from '@/lib/amme/rbac'
import * as mgmt from '@/lib/amme/management'

const ACTION_PERMISSION: Record<string, AmmePermission> = {
  resource_upsert: 'settings:write',
  waitlist_add: 'booking:write',
  deposit_update: 'payment:write',
  station_upsert: 'settings:write',
  inventory_upsert: 'inventory:write',
  inventory_adjust: 'inventory:write',
  recipe_set: 'inventory:write',
  package_upsert: 'settings:write',
  package_assign: 'crm:write',
  rfm_recompute: 'crm:write',
  automation_upsert: 'automation:write',
  message_queue: 'crm:write',
  shift_open: 'visit:write',
  shift_note: 'visit:write',
}

export async function GET(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    assertAmmePermission(session, 'state:read')
    const day = request.nextUrl.searchParams.get('day') || new Date().toISOString().slice(0, 10)
    const [management, analytics] = await Promise.all([
      mgmt.getManagementState(session.venueId, day),
      mgmt.getOwnerAnalytics(session.venueId, day),
    ])
    return NextResponse.json({ success: true, management, analytics })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Ошибка' },
      { status: 403 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const type = String(body.type || '')
    const permission = ACTION_PERMISSION[type]
    if (!permission) throw new Error(`Unknown management action: ${type}`)
    assertAmmePermission(session, permission)

    switch (type) {
      case 'resource_upsert':
        await mgmt.upsertResource(session.venueId, body, session.userId)
        break
      case 'waitlist_add':
        await mgmt.addWaitlist(session.venueId, body, session.userId)
        break
      case 'deposit_update':
        await mgmt.updateDeposit(
          session.venueId,
          body.bookingId,
          Number(body.amount || 0),
          body.status,
          body.method || 'CASH',
          session.userId
        )
        break
      case 'station_upsert':
        await mgmt.upsertStation(session.venueId, body, session.userId)
        break
      case 'inventory_upsert':
        await mgmt.upsertInventoryItem(session.venueId, body, session.userId)
        break
      case 'inventory_adjust':
        await mgmt.adjustInventory(
          session.venueId,
          body.inventoryItemId,
          Number(body.quantity),
          body.movementType || 'ADJUSTMENT',
          body.note,
          session.userId
        )
        break
      case 'recipe_set':
        await mgmt.setRecipe(
          session.venueId,
          body.menuItemId,
          Array.isArray(body.ingredients) ? body.ingredients : [],
          session.userId
        )
        break
      case 'package_upsert':
        await mgmt.upsertPackage(session.venueId, body, session.userId)
        break
      case 'package_assign':
        await mgmt.assignPackage(session.venueId, body.guestId, body.packageId, session.userId)
        break
      case 'rfm_recompute':
        await mgmt.recomputeRfm(session.venueId)
        break
      case 'automation_upsert':
        await mgmt.upsertAutomation(session.venueId, body, session.userId)
        break
      case 'message_queue':
        await mgmt.queueMessage(session.venueId, body, session.userId)
        break
      case 'shift_open':
        await mgmt.openShift(session.venueId, session.userId, session.staffRole, session.userId)
        break
      case 'shift_note':
        await mgmt.addShiftNote(session.venueId, body.shiftId, body.body, session.userId)
        break
    }

    const day = body.day || new Date().toISOString().slice(0, 10)
    const [management, analytics] = await Promise.all([
      mgmt.getManagementState(session.venueId, day),
      mgmt.getOwnerAnalytics(session.venueId, day),
    ])
    return NextResponse.json({ success: true, management, analytics })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Ошибка' },
      { status: 400 }
    )
  }
}
