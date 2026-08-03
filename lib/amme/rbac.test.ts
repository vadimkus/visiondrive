import { describe, expect, it } from 'vitest'
import { hasAmmePermission } from './rbac'
import type { AmmeSession } from './session'

function session(staffRole: AmmeSession['staffRole'], permissions: string[] = []): AmmeSession {
  return {
    userId: 'user',
    email: 'user@example.com',
    role: 'ADMIN',
    tenantId: 'tenant',
    staffRole,
    permissions,
    venueId: 'venue',
    name: 'User',
  }
}

describe('AMMÉ RBAC', () => {
  it('limits kitchen to KDS operations', () => {
    expect(hasAmmePermission(session('KITCHEN'), 'kds:write')).toBe(true)
    expect(hasAmmePermission(session('KITCHEN'), 'payment:write')).toBe(false)
    expect(hasAmmePermission(session('KITCHEN'), 'crm:read')).toBe(false)
  })

  it('keeps cash and CRM available to admin but protects settings', () => {
    expect(hasAmmePermission(session('ADMIN'), 'payment:write')).toBe(true)
    expect(hasAmmePermission(session('ADMIN'), 'crm:write')).toBe(true)
    expect(hasAmmePermission(session('ADMIN'), 'settings:write')).toBe(false)
  })

  it('allows owner control and explicit overrides', () => {
    expect(hasAmmePermission(session('OWNER'), 'settings:write')).toBe(true)
    expect(hasAmmePermission(session('KITCHEN', ['report:read']), 'report:read')).toBe(true)
  })
})
