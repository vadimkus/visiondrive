import type { Prisma } from '@prisma/client'

type PrismaLike = Prisma.TransactionClient

export type PublicBookingConfirmationMode = 'REQUEST' | 'INSTANT'

type ClinicSettings = {
  publicBooking?: {
    enabled?: boolean
    confirmationMode?: PublicBookingConfirmationMode
  }
}

function asClinicSettings(value: Prisma.JsonValue | null | undefined): ClinicSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as ClinicSettings
}

export function publicBookingEnabledFromSettings(value: Prisma.JsonValue | null | undefined) {
  return asClinicSettings(value).publicBooking?.enabled === true
}

export function normalizePublicBookingConfirmationMode(value: unknown): PublicBookingConfirmationMode {
  return String(value ?? '').trim().toUpperCase() === 'INSTANT' ? 'INSTANT' : 'REQUEST'
}

export function publicBookingConfirmationModeFromSettings(
  value: Prisma.JsonValue | null | undefined
): PublicBookingConfirmationMode {
  return normalizePublicBookingConfirmationMode(asClinicSettings(value).publicBooking?.confirmationMode)
}

export function publicBookingSettingsFromThresholds(value: Prisma.JsonValue | null | undefined) {
  return {
    enabled: publicBookingEnabledFromSettings(value),
    confirmationMode: publicBookingConfirmationModeFromSettings(value),
  }
}

export async function getPublicBookingEnabled(db: PrismaLike, tenantId: string) {
  const settings = await db.tenantSetting.findUnique({
    where: { tenantId },
    select: { thresholds: true },
  })
  return publicBookingEnabledFromSettings(settings?.thresholds)
}

export async function getPublicBookingSettings(db: PrismaLike, tenantId: string) {
  const settings = await db.tenantSetting.findUnique({
    where: { tenantId },
    select: { thresholds: true },
  })
  return publicBookingSettingsFromThresholds(settings?.thresholds)
}

export async function setPublicBookingEnabled(
  db: PrismaLike,
  tenantId: string,
  enabled: boolean
) {
  await setPublicBookingSettings(db, tenantId, { enabled })
  return enabled
}

export async function setPublicBookingSettings(
  db: PrismaLike,
  tenantId: string,
  patch: Partial<{ enabled: boolean; confirmationMode: PublicBookingConfirmationMode }>
) {
  const existing = await db.tenantSetting.findUnique({
    where: { tenantId },
    select: { thresholds: true },
  })
  const current = asClinicSettings(existing?.thresholds)
  const next = {
    ...current,
    publicBooking: {
      ...current.publicBooking,
      ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
      ...(patch.confirmationMode ? { confirmationMode: normalizePublicBookingConfirmationMode(patch.confirmationMode) } : {}),
    },
  }

  await db.tenantSetting.upsert({
    where: { tenantId },
    create: { tenantId, thresholds: next },
    update: { thresholds: next },
  })

  return publicBookingSettingsFromThresholds(next)
}
