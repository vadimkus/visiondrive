import type { AmmeSession } from '@/lib/amme/session'
import type { AmmeStaffRole } from '@prisma/client'

export type AmmePermission =
  | 'state:read'
  | 'booking:write'
  | 'visit:write'
  | 'kds:write'
  | 'payment:write'
  | 'crm:read'
  | 'crm:write'
  | 'report:read'
  | 'menu:write'
  | 'inventory:write'
  | 'staff:write'
  | 'settings:write'
  | 'automation:write'

const ROLE_PERMISSIONS: Record<AmmeStaffRole, ReadonlySet<AmmePermission>> = {
  KITCHEN: new Set(['state:read', 'kds:write']),
  ADMIN: new Set([
    'state:read',
    'booking:write',
    'visit:write',
    'kds:write',
    'payment:write',
    'crm:read',
    'crm:write',
    'report:read',
    'inventory:write',
  ]),
  OWNER: new Set([
    'state:read',
    'booking:write',
    'visit:write',
    'kds:write',
    'payment:write',
    'crm:read',
    'crm:write',
    'report:read',
    'menu:write',
    'inventory:write',
    'staff:write',
    'settings:write',
    'automation:write',
  ]),
}

export function hasAmmePermission(session: AmmeSession, permission: AmmePermission) {
  if (session.permissions.includes('*') || session.permissions.includes(permission)) return true
  return ROLE_PERMISSIONS[session.staffRole].has(permission)
}

export function assertAmmePermission(session: AmmeSession, permission: AmmePermission) {
  if (!hasAmmePermission(session, permission)) {
    throw new Error(`Недостаточно прав: ${permission}`)
  }
}

export const AMME_ACTION_PERMISSION: Record<string, AmmePermission> = {
  arrive: 'visit:write',
  noshow: 'booking:write',
  unmark: 'booking:write',
  toggle_banya: 'booking:write',
  walkin: 'visit:write',
  add_dish: 'visit:write',
  bump: 'visit:write',
  send: 'kds:write',
  done: 'kds:write',
  move: 'visit:write',
  pay: 'payment:write',
  close: 'payment:write',
  end_banya: 'visit:write',
  import: 'booking:write',
  booking_create: 'booking:write',
  menu_update: 'menu:write',
}
